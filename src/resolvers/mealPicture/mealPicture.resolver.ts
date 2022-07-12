import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Service } from "typedi";
import { AdminGuard } from "../../middlewares/admin.middleware";
import BaseMeal from "../meal/baseMeal";
import MealService from "../meal/meal.service";
import BaseRestaurant from "../restaurant/baseRestaurant";
import RestaurantService from "../restaurant/restaurant.service";
import BaseMealPicture from "./baseMealPicture";
import {
  CreateMealPictureInput,
  MealPicture,
  UpdateMealPictureInput,
} from "./mealPicture.gql";
import MealPictureService from "./mealPicture.service";

@Service()
@Resolver(MealPicture)
class MealPictureResolver {
  constructor(
    private mealPictureService: MealPictureService,
    private mealService: MealService,
    private restaurantService: RestaurantService
  ) {}

  @FieldResolver()
  async meal(
    @Root() mealPicture: MealPicture & { mealId: string }
  ): Promise<BaseMeal | null> {
    return this.mealService.findMeal(mealPicture.mealId);
  }

  @FieldResolver()
  async restaurant(
    @Root() mealPicture: MealPicture & { restaurantId: string }
  ): Promise<BaseRestaurant | null> {
    return this.restaurantService.findRestaurant(mealPicture.restaurantId);
  }

  @Query(() => [MealPicture])
  async mealsPictures(): Promise<BaseMealPicture[]> {
    return this.mealPictureService.findMealsPictures();
  }

  @Query(() => MealPicture, { nullable: true })
  async mealPicture(@Arg("id") id: string): Promise<BaseMealPicture | null> {
    return this.mealPictureService.findMealPicture(id);
  }

  @Mutation(() => MealPicture)
  @UseMiddleware(AdminGuard)
  async createMealPicture(
    @Arg("input", () => CreateMealPictureInput) input: CreateMealPictureInput
  ): Promise<BaseMealPicture> {
    return this.mealPictureService.createMealPicture(input);
  }

  @Mutation(() => MealPicture)
  @UseMiddleware(AdminGuard)
  async updateMealPicture(
    @Arg("input", () => UpdateMealPictureInput) input: UpdateMealPictureInput
  ): Promise<BaseMealPicture> {
    return this.mealPictureService.updateMealPicture(input);
  }

  @Mutation(() => MealPicture)
  @UseMiddleware(AdminGuard)
  async delateMealPicture(
    @Arg("id", () => ID) id: string
  ): Promise<BaseMealPicture> {
    return this.mealPictureService.deleteMealPicture(id);
  }
}

export default MealPictureResolver;
