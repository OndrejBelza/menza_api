import { MealPrice } from "@prisma/client";
import { Service } from "typedi";
import PrismaService from "../../services/prisma.service";
import MealService from "../meal/meal.service";
import RestaurantService from "../restaurant/restaurant.service";

@Service()
class MealPriceService {
  constructor(
    private prismaService: PrismaService,
    private restaurantService: RestaurantService,
    private mealService: MealService
  ) {}

  async findMealsPrices(): Promise<MealPrice[]> {
    return this.prismaService.mealPrice.findMany();
  }

  async findMealPrice(id: string): Promise<MealPrice | null> {
    return this.prismaService.mealPrice.findFirst({ where: { id } });
  }

  async findMealPrices(mealId: string): Promise<MealPrice[]> {
    return this.prismaService.mealPrice.findMany({ where: { mealId } });
  }

  async findRestaurantMealsPrices(restaurantId: string): Promise<MealPrice[]> {
    return this.prismaService.mealPrice.findMany({ where: { restaurantId } });
  }

  async findRestaurantMealPricesForDate(
    mealId: string,
    restaurantId: string,
    date: Date
  ): Promise<MealPrice | null> {
    return this.prismaService.mealPrice.findFirst({
      where: {
        mealId,
        restaurantId,
        date,
      },
    });
  }

  async findRestaurantMealsPricesForDate(
    restaurantId: string,
    date: Date
  ): Promise<MealPrice[]> {
    return this.prismaService.mealPrice.findMany({
      where: { restaurantId, date },
    });
  }

  async findRestaurantMealPrices(
    restaurantId: string,
    mealId: string
  ): Promise<MealPrice[]> {
    return this.prismaService.mealPrice.findMany({
      where: { restaurantId, mealId },
    });
  }

  async createMealPrice(input: {
    priceStudent: number;
    priceRegular: number;
    mealId: string;
    date: Date;
    restaurantId: string;
  }): Promise<MealPrice> {
    const restaurant = this.restaurantService.findRestaurant(
      input.restaurantId
    );
    if (!restaurant) throw new Error("Invalid restaurantId");
    const meal = this.mealService.findMeal(input.mealId);
    if (!meal) throw new Error("Invalid mealId");

    return this.prismaService.mealPrice.create({
      data: {
        ...input,
      },
    });
  }

  async deleteMealPrice(id: string): Promise<MealPrice> {
    const mealPrice = this.findMealPrice(id);
    if (!mealPrice) throw new Error("Invalid mealPriceId");
    return this.prismaService.mealPrice.delete({ where: { id } });
  }

  async updateMealPrice(input: {
    id: string;
    priceStudent: number;
    priceRegular: number;
    mealId: string;
    date: Date;
    restaurantId: string;
  }): Promise<MealPrice> {
    const mealPrice = this.findMealPrice(input.id);
    if (!mealPrice) throw new Error("Invalid mealPriceId");
    const restaurant = this.restaurantService.findRestaurant(
      input.restaurantId
    );
    if (!restaurant) throw new Error("Invalid restaurantId");
    const meal = this.mealService.findMeal(input.mealId);
    if (!meal) throw new Error("Invalid mealId");

    return this.prismaService.mealPrice.update({
      where: { id: input.id },
      data: { ...input },
    });
  }
}

export default MealPriceService;
