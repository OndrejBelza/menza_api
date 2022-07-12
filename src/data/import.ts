import dayjs from "dayjs";
import { Service } from "typedi";
import { ScrapingService } from "../crons/menzaScraping";
import CategoryService from "../resolvers/category/category.service";
import MealService from "../resolvers/meal/meal.service";
import MealPictureService from "../resolvers/mealPicture/mealPicture.service";
import MealPriceService from "../resolvers/mealPrice/mealPrice.service";
import RestaurantService from "../resolvers/restaurant/restaurant.service";
import meals from "./meals.json";

// const wait = async (ms: number) =>
//   new Promise((resolve) => setTimeout(() => resolve(null), ms));

enum Categories {
  "soup" = "Polévka",
  "mainDish" = "Hlavní jídla",
  "desert" = "Moučníky",
  "specialOfTheDay" = "Specialita dne",
  "minutes" = "Minutky",
  "vegetarian" = "Vegetariánská jídla",
  "mealsWithoutMeat" = "Bezmasá jídla",
  "coldMeals" = "Studená jídla",
  "saladsAndDishes" = "Saláty a talíře",
}

enum Restaurants {
  "technicka" = "Technická menza",
  "archiCafe" = "ArchiCafé",
  "bistroMUVS" = "Bistro MÚVS",
  "megaBufFat" = "MEGA BUF FAT",
  "kladno" = "Menza Kladno",
  "podoli" = "Menza Podolí",
  "strahov" = "Menza Strahov",
  "studentskyDum" = "Studentský dům",
  "vydejnaHorska" = "Výdejna Horská",
  "vydejnaKarlovoNamesti" = "Výdejna Karlovo náměstí",
}

const restaurantsUrl: Record<Restaurants, string> = {
  "Bistro MÚVS": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=13",
  ArchiCafé: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=15",
  "MEGA BUF FAT": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=12",
  "Menza Kladno": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=9",
  "Menza Podolí": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=4",
  "Menza Strahov": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=1",
  "Studentský dům": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=2",
  "Technická menza": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=3",
  "Výdejna Horská": "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=6",
  "Výdejna Karlovo náměstí":
    "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=8",
};

@Service()
class ImportService {
  constructor(
    private restaurantService: RestaurantService,
    private categoryService: CategoryService,
    private mealService: MealService,
    private mealPictureService: MealPictureService,
    private scrapingService: ScrapingService,
    private mealPriceService: MealPriceService
  ) {}

  async translateCategory(category: string) {
    const newCategory = Categories[category as keyof typeof Categories];
    if (!newCategory) throw new Error("Invalid category");
    let dbCategory = await this.categoryService.findCategoryByName(newCategory);
    if (!dbCategory)
      dbCategory = await this.categoryService.createCategory(newCategory);

    return dbCategory;
  }

  async createRestaurants() {
    await this.restaurantService.findRestaurants();
    for (const restaurant of Object.keys(restaurantsUrl)) {
      let dbRestaurant = await this.restaurantService.findRestaurantByName(
        restaurant
      );
      if (!dbRestaurant) {
        // @ts-ignore
        const restaurantUrl: string = restaurantsUrl[restaurant];

        dbRestaurant = await this.restaurantService.createRestaurant(
          restaurant,
          restaurantUrl
        );
      }
    }
  }

  async createMealIfNew(
    name: string,
    nameNormalized: string,
    categoryId: string
  ) {
    let meal = await this.mealService.findMealByNormalizedName(nameNormalized);
    if (!meal)
      meal = await this.mealService.createMeal(
        name,
        nameNormalized,
        categoryId
      );

    return meal;
  }

  async getRestaurantFromImgUrl(url: string) {
    if (url.includes("Podsystem_1"))
      return await this.restaurantService.findRestaurantByName("Menza Strahov");
    if (url.includes("Podsystem_2"))
      return await this.restaurantService.findRestaurantByName(
        "Studentský dům"
      );
    if (url.includes("Podsystem_3"))
      return await this.restaurantService.findRestaurantByName(
        "Technická menza"
      );
    if (url.includes("Podsystem_4"))
      return await this.restaurantService.findRestaurantByName("Menza Podolí");
    if (url.includes("Podsystem_6"))
      return await this.restaurantService.findRestaurantByName(
        "Výdejna Horská"
      );
    if (url.includes("Podsystem_8"))
      return await this.restaurantService.findRestaurantByName(
        "Výdejna Karlovo náměstí"
      );
    if (url.includes("Podsystem_9"))
      return await this.restaurantService.findRestaurantByName("Menza Kladno");
    if (url.includes("Podsystem_12"))
      return await this.restaurantService.findRestaurantByName("MEGA BUF FAT");
    if (url.includes("Podsystem_13"))
      return await this.restaurantService.findRestaurantByName("Bistro MÚVS");
    if (url.includes("Podsystem_15"))
      return await this.restaurantService.findRestaurantByName("ArchiCafé");

    return null;
  }

  async addMealPriceIfNew(
    mealId: string,
    restaurantId: string,
    date: Date,
    priceRegular: number,
    priceStudent: number
  ) {
    const dbMealPrice =
      await this.mealPriceService.findRestaurantMealPricesForDate(
        mealId,
        restaurantId,
        date
      );
    if (!dbMealPrice)
      await this.mealPriceService.createMealPrice({
        priceRegular,
        priceStudent,
        date,
        mealId,
        restaurantId,
      });
  }

  async addMealImg(mealId: string, mealName: string, imgUrl: string) {
    const restaurant = await this.getRestaurantFromImgUrl(imgUrl);
    if (!restaurant) throw new Error("Restaurant from image was not found");
    const mealImg =
      await this.mealPictureService.findMealPictureByMealIdAndRestaurantId(
        mealId,
        restaurant.id
      );
    console.log(mealImg);
    if (!mealImg) {
      const { contentType, ext, img } =
        await this.scrapingService.downloadImage(imgUrl);
      const filename = `${mealName.replace(/\/|\-|\_|\.|\*|\'|\(|\)/gi, " ")}-${
        restaurant.name
      }-${dayjs().format("YYYY-MM-DD")}.${ext}`;
      console.log("Uploading file", filename);
      const uploadResponse = await this.scrapingService.uploadImage(
        img,
        filename,
        contentType
      );
      await this.mealPictureService.createMealPicture({
        img: uploadResponse.Key,
        mealId,
        restaurantId: restaurant.id,
      });
    }
  }

  async import() {
    await this.createRestaurants();

    const filteredMeals = meals.data.meals.data.filter(
      (meal) => meal.attributes.category !== "unknown"
    );

    for (const meal of filteredMeals) {
      const { name, nameNormalized, category, meal_prices, img } =
        meal.attributes;
      const dbCategory = await this.translateCategory(category);

      const dbMeal = await this.createMealIfNew(
        name,
        nameNormalized,
        dbCategory.id
      );

      for (const mealPrice of meal_prices.data) {
        const { date, location, priceRegular, priceStudent } =
          mealPrice.attributes;

        const restaurant = Restaurants[location as keyof typeof Restaurants];
        if (!restaurant) throw new Error("Unable to find restaurant");

        const dbRestaurant = await this.restaurantService.findRestaurantByName(
          restaurant
        );
        if (!dbRestaurant) throw new Error("Restaurant is not in db");

        await this.addMealPriceIfNew(
          dbMeal.id,
          dbRestaurant.id,
          dayjs(date).toDate(),
          priceRegular,
          priceStudent
        );
      }

      if (img && img.data) {
        const { url } = img.data.attributes;
        await this.addMealImg(dbMeal.id, dbMeal.name, url);
        // await wait(1000);
      }
    }
  }
}

export default ImportService;
