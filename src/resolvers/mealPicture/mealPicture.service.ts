import { MealPicture } from "@prisma/client";
import { Service } from "typedi";
import PrismaService from "../../services/prisma.service";
import MealService from "../meal/meal.service";
import RestaurantService from "../restaurant/restaurant.service";

@Service()
class MealPictureService {
  constructor(
    private prismaService: PrismaService,
    private mealService: MealService,
    private restaurantService: RestaurantService
  ) {}

  async findMealsPictures(): Promise<MealPicture[]> {
    return this.prismaService.mealPicture.findMany();
  }

  async findMealPicture(id: string): Promise<MealPicture | null> {
    return this.prismaService.mealPicture.findFirst({ where: { id } });
  }

  async findMealPictureByMealIdAndRestaurantId(
    mealId: string,
    restaurantId: string
  ): Promise<MealPicture | null> {
    return this.prismaService.mealPicture.findFirst({
      where: {
        mealId,
        restaurantId,
      },
    });
  }

  async findMealPictures(mealId: string): Promise<MealPicture[]> {
    return this.prismaService.mealPicture.findMany({ where: { mealId } });
  }

  async createMealPicture(input: {
    img: string;
    mealId: string;
    restaurantId: string;
  }): Promise<MealPicture> {
    const meal = this.mealService.findMeal(input.mealId);
    if (!meal) throw new Error("Invalid mealId");

    const restaurant = this.restaurantService.findRestaurant(
      input.restaurantId
    );
    if (!restaurant) throw new Error("Invalid restaurantId");

    return this.prismaService.mealPicture.create({
      data: {
        ...input,
      },
    });
  }

  async deleteMealPicture(id: string): Promise<MealPicture> {
    const mealPicture = this.findMealPicture(id);
    if (!mealPicture) throw new Error("Invalid mealPictureID");
    return this.prismaService.mealPicture.delete({ where: { id } });
  }

  async updateMealPicture(input: {
    id: string;
    img: string;
    mealId: string;
    restaurantId: string;
  }): Promise<MealPicture> {
    const meal = this.mealService.findMeal(input.mealId);
    if (!meal) throw new Error("Invalid mealId");

    const restaurant = this.restaurantService.findRestaurant(
      input.restaurantId
    );
    if (!restaurant) throw new Error("Invalid restaurantId");

    const picture = this.findMealPicture(input.id);
    if (!picture) throw new Error("Invalid pictureId");

    return this.prismaService.mealPicture.update({
      where: { id: input.id },
      data: {
        ...input,
      },
    });
  }
}

export default MealPictureService;
