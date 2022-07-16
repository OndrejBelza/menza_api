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
import MealLoader from "../../dataloaders/mealLoader";
import RestaurantLoader from "../../dataloaders/restaurantLoader";
import { AdminGuard } from "../../middlewares/admin.middleware";
import BaseMeal from "../meal/baseMeal";
import BaseRestaurant from "../restaurant/baseRestaurant";
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
    private mealLoader: MealLoader,
    private restaurantLoader: RestaurantLoader
  ) {}

  @FieldResolver()
  async meal(
    @Root() mealPicture: MealPicture & { mealId: string }
  ): Promise<BaseMeal | undefined> {
    return this.mealLoader.load(mealPicture.mealId);
  }

  @FieldResolver()
  async restaurant(
    @Root() mealPicture: MealPicture & { restaurantId: string }
  ): Promise<BaseRestaurant | undefined> {
    return this.restaurantLoader.load(mealPicture.restaurantId);
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
