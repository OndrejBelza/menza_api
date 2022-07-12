import { Cron, CronController } from "cron-decorators";
import RestaurantService from "../resolvers/restaurant/restaurant.service";
import axios from "axios";
import { Service } from "typedi";
import AWS from "aws-sdk";
import mime from "mime-types";
import cheerio from "cheerio";
import normalizeMealName from "../utils/normalizeMealName";
import CategoryService from "../resolvers/category/category.service";
import MealService from "../resolvers/meal/meal.service";
import {
  Meal as DbMeal,
  MealPrice as DbMealPrice,
  MealPicture as DbMealPicture,
} from "@prisma/client";
import MealPriceService from "../resolvers/mealPrice/mealPrice.service";
import MealPictureService from "../resolvers/mealPicture/mealPicture.service";
import dayjs from "dayjs";

type Meal = {
  portion?: string;
  name: string;
  nameNormalized: string;
  imgUrl?: string;
  priceStudent: number;
  priceRegular: number;
};

type Menu = {
  [category: string]: Meal[];
};

@Service()
export class ScrapingService {
  private s3Service: AWS.S3;
  constructor(
    private categoryService: CategoryService,
    private mealService: MealService,
    private mealPriceService: MealPriceService,
    private mealPictureService: MealPictureService
  ) {
    this.s3Service = new AWS.S3({
      region: "eu-central-1",
      apiVersion: "2006-03-01",
    });
  }

  private baseImageUrl = "http://agata.suz.cvut.cz/jidelnicky";

  private formatImgUrl = (href: string): string => {
    return this.baseImageUrl + "/" + href.replace("imgshow", "showfoto");
  };

  async getMenu(url: string): Promise<Menu> {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const menu: Menu = {};

    const menuTable = $("#jidelnicek table.table.table-condensed tbody ");

    let currentCategory: string;
    let meals: Meal[] = [];

    $(menuTable)
      .find("tr")
      .each((_, r) => {
        const row = $(r);
        // Row with category name
        if (row.find("th").length) {
          const categoryName = row.find("th").first().text();
          if (!currentCategory) currentCategory = categoryName;
          else {
            menu[currentCategory] = meals;
            meals = [];
            currentCategory = categoryName;
          }
        }
        // Row with meal
        else {
          const meal: Partial<Meal> = {};
          row.find("td").each((columnIndex, column) => {
            const content = $(column).text().trim();
            // portion
            if (columnIndex === 1) {
              meal.portion = content;
            }
            if (columnIndex === 2) {
              meal.name = content;
              meal.nameNormalized = normalizeMealName(content);
            }
            if (columnIndex === 4) {
              $(column)
                .find("a")
                .each((_, image) => {
                  meal.imgUrl = this.formatImgUrl(
                    $(image).attr("href") as string
                  );
                });
            }
            if (columnIndex === 5)
              meal.priceStudent = parseFloat(content.replace(",", "."));
            if (columnIndex === 6)
              meal.priceRegular = parseFloat(content.replace(",", "."));
          });
          if (
            meal.name &&
            meal.nameNormalized &&
            meal.priceRegular &&
            meal.priceStudent
          )
            meals.push(meal as Meal);
        }
      });

    return menu;
  }

  async downloadImage(
    url: string
  ): Promise<{ img: any; contentType: string; ext: string }> {
    const response = await axios.get<any>(url, {
      responseType: "stream",
    });
    const contentType = response.headers["content-type"];
    const ext = mime.extension(response.headers["content-type"]);
    if (!ext) throw new Error("Invalid extension");

    return {
      img: response.data,
      contentType,
      ext,
    };
  }
  async uploadImage(data: any, filename: string, contentType: string) {
    return this.s3Service
      .upload({
        Bucket: "menza",
        Key: filename,
        Body: data,
        ACL: "public-read",
        ContentType: contentType,
      })
      .promise();
  }

  async processCategories(categories: string[]) {
    const dbCategories = await this.categoryService.findCategories();
    const missingCategories = categories.filter((category) =>
      dbCategories.every((dbCategory) => dbCategory.name !== category)
    );
    for (const category of missingCategories) {
      await this.categoryService.createCategory(category);
    }
  }

  async processMeal(
    meal: Meal,
    categoryId: string,
    restaurantId: string,
    restaurantName: string,
    date: Date
  ) {
    let dbMeal: DbMeal | null = await this.mealService.findMealByNormalizedName(
      meal.nameNormalized
    );
    if (!dbMeal)
      dbMeal = await this.mealService.createMeal(
        meal.name,
        meal.nameNormalized,
        categoryId
      );

    let dbMealPrice: DbMealPrice | null =
      await this.mealPriceService.findRestaurantMealPricesForDate(
        dbMeal.id,
        restaurantId,
        date
      );

    if (!dbMealPrice)
      dbMealPrice = await this.mealPriceService.createMealPrice({
        mealId: dbMeal.id,
        date,
        restaurantId,
        priceRegular: meal.priceRegular,
        priceStudent: meal.priceStudent,
      });

    if (meal.imgUrl) {
      let dbMealPicture: DbMealPicture | null =
        await this.mealPictureService.findMealPictureByMealIdAndRestaurantId(
          dbMeal.id,
          restaurantId
        );

      if (!dbMealPicture) {
        const { img, ext, contentType } = await this.downloadImage(meal.imgUrl);
        const filename = `${meal.name.replace(
          /\/|\-|\_|\.|\*|\'|\(|\)/gi,
          " "
        )}-${restaurantName}-${dayjs().format("YYYY-MM-DD")}.${ext}`;
        const uploadResult = await this.uploadImage(img, filename, contentType);

        console.log(uploadResult);

        dbMealPicture = await this.mealPictureService.createMealPicture({
          mealId: dbMeal.id,
          restaurantId,
          img: uploadResult.Key,
        });
      }
    }
  }
}

@Service()
@CronController("menza-scraping")
export class JobController {
  constructor(
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private scrapingService: ScrapingService
  ) {}

  @Cron("scrape-menza", "0 9-20 * * 1-5")
  async scrape(): Promise<void> {
    const restaurants = await this.restaurantService.findRestaurants();

    for (let i = 0; i < restaurants.length; i += 1) {
      const restaurant = restaurants[i];
      if (!restaurant || !restaurant.scrape || !restaurant.menuUrl) continue;

      const menu = await this.scrapingService.getMenu(restaurant.menuUrl);

      const categories = Object.keys(menu);
      await this.scrapingService.processCategories(categories);

      for (let j = 0; j < categories.length; j += 1) {
        const category = await this.categoryService.findCategoryByName(
          categories[j]
        );

        if (!category) throw new Error("Invalid category while scraping.");

        for (const meal of menu[category.name]) {
          await this.scrapingService.processMeal(
            meal,
            category.id,
            restaurant.id,
            restaurant.name,
            new Date()
          );
        }
      }
    }
    await axios.get(`${process.env.CRON_MONITOR_URL}`);
  }
}
