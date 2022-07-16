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

const restaurantsDefinition: Record<
  Restaurants,
  {
    menuUrl: string;
    address: string;
    openingHours: string;
    img: string;
    scrapingStartedAt: Date;
  }
> = {
  "Bistro MÚVS": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=13",
    address: "Kolejní 2637, 160 00 Praha 6",
    img: "https://www.suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/_k2_2163-2.jpg?itok=uk2XpxVv",
    openingHours: "Po - Pá 8:30 - 16:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  ArchiCafé: {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=15",
    address: "Thákurova 9, 160 00 Praha 6",
    img: "https://www.suz.cvut.cz/sites/default/files/imce/20180111_001_cvut-vic-ryszawy_1.jpg",
    openingHours: "Po - Čt 8:30 - 17:30, Pá 8:30 - 14:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "MEGA BUF FAT": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=12",
    address: "Thákurova 2077/7, 160 00 Praha 6",
    img: "https://www.suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/20180111_004_cvut-vic-ryszawy.jpg?itok=rHwWnHjR",
    openingHours: "Po - Čt 7:30 - 18:00, Pá 7:30 - 14:30",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Menza Kladno": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=9",
    address: "nám. Sítná 3105, 272 01 Kladno",
    img: "http://suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/kladno_02_n.jpg?itok=dg3P09o7",
    openingHours: "Po - Pá 10:30 - 14:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Menza Podolí": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=4",
    address: "Na Lysině 772/12, 147 00 Praha 4",
    img: "http://www.suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/podoli-in3.jpg?itok=Br2b45mb",
    openingHours: "Po - Čt 11:00 - 14:30 17:00 - 20:30, Pá 11:00 - 14:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Menza Strahov": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=1",
    address: "Jezdecká 1920, 160 17 Praha 6-Strahov",
    img: "https://www.suz.cvut.cz/sites/default/files/imce/menza-strahov-j1.jpg",
    openingHours: "Po - Pá 11:00 - 15:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Studentský dům": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=2",
    address: "Bílá 6, 160 00 Praha 6",
    img: "http://www.suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/sd-4.jpg?itok=bLiYLTW_",
    openingHours: "Po - Pá 10:30 - 14:30",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Technická menza": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=3",
    address: "Jugoslávských partyzánů 1580, 160 00 Praha 6",
    img: "http://suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/jidelna1.jpg?itok=N7Kt38mJ",
    openingHours: "Po - Pá 7:30 - 10:00 10:45 - 14:30",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Výdejna Horská": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=6",
    address: "Horská 2040/3, 128 00 Nové Město",
    img: "https://www.suz.cvut.cz/sites/default/files/imce/horska-3.jpg",
    openingHours: "Po - Pá 11:00 - 14:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
  "Výdejna Karlovo náměstí": {
    menuUrl: "http://agata.suz.cvut.cz/jidelnicky/?clPodsystem=8",
    address: "Karlovo nám. 293/13, 120 00 Nové Město",
    img: "http://suz.cvut.cz/sites/default/files/styles/gallery_full/public/img/article/gallery/kn-1.jpg?itok=mhdt5XJP",
    openingHours: "Po - Čt 10:30 - 14:30, Pá 10:30 - 14:00",
    scrapingStartedAt: dayjs("2022-05-03").toDate(),
  },
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
    for (const restaurant of Object.keys(restaurantsDefinition)) {
      let dbRestaurant = await this.restaurantService.findRestaurantByName(
        restaurant
      );
      if (!dbRestaurant) {
        const restaurantDefinition: {
          menuUrl: string;
          address: string;
          openingHours: string;
          img: string;
          scrapingStartedAt: Date;
        } =
          // @ts-ignore
          restaurantsDefinition[restaurant];

        dbRestaurant = await this.restaurantService.createRestaurant({
          name: restaurant,
          ...restaurantDefinition,
        });
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
