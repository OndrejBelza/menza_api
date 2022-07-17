import { UUIDResolver } from "graphql-scalars";
import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import MealLoader from "../../dataloaders/mealLoader";
import RestaurantLoader from "../../dataloaders/restaurantLoader";
import BaseMeal from "../meal/baseMeal";
import BaseRestaurant from "../restaurant/baseRestaurant";
import BaseMealPrice from "./baseMealPrice";
import {
  CreateMealPriceInput,
  MealPrice,
  UpdateMealPriceInput,
} from "./mealPrice.gql";
import MealPriceService from "./mealPrice.service";

@Service()
@Resolver(MealPrice)
class MealPriceResolver {
  constructor(
    private mealPriceService: MealPriceService,
    private mealLoader: MealLoader,
    private restaurantLoader: RestaurantLoader
  ) {}

  @FieldResolver()
  async meal(
    @Root() mealPrice: BaseMealPrice & { mealId: string }
  ): Promise<BaseMeal | undefined> {
    return this.mealLoader.load(mealPrice.mealId);
  }

  @FieldResolver()
  async restaurant(
    @Root() mealPrice: BaseMealPrice & { restaurantId: string }
  ): Promise<BaseRestaurant | undefined> {
    return this.restaurantLoader.load(mealPrice.restaurantId);
  }

  @Query(() => [MealPrice])
  async mealsPrices(): Promise<BaseMealPrice[]> {
    return this.mealPriceService.findMealsPrices();
  }

  @Query(() => MealPrice, { nullable: true })
  async mealPrice(
    @Arg("id", () => UUIDResolver) id: string
  ): Promise<BaseMealPrice | null> {
    return this.mealPriceService.findMealPrice(id);
  }

  @Mutation(() => MealPrice)
  async createMealPrice(
    @Arg("input", () => CreateMealPriceInput) input: CreateMealPriceInput
  ): Promise<BaseMealPrice> {
    return this.mealPriceService.createMealPrice(input);
  }

  @Mutation(() => MealPrice)
  async updateMealPrice(
    @Arg("input", () => UpdateMealPriceInput) input: UpdateMealPriceInput
  ): Promise<BaseMealPrice> {
    return this.mealPriceService.updateMealPrice(input);
  }
}

export default MealPriceResolver;
