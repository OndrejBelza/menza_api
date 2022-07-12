import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import BaseMeal from "../meal/baseMeal";
import MealService from "../meal/meal.service";
import BaseRestaurant from "../restaurant/baseRestaurant";
import RestaurantService from "../restaurant/restaurant.service";
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
    private mealService: MealService,
    private restaurantService: RestaurantService
  ) {}

  @FieldResolver()
  async meal(
    @Root() mealPrice: BaseMealPrice & { mealId: string }
  ): Promise<BaseMeal | null> {
    return this.mealService.findMeal(mealPrice.mealId);
  }

  @FieldResolver()
  async restaurant(
    @Root() mealPrice: BaseMealPrice & { restaurantId: string }
  ): Promise<BaseRestaurant | null> {
    return this.restaurantService.findRestaurant(mealPrice.restaurantId);
  }

  @Query(() => [MealPrice])
  async mealsPrices(): Promise<BaseMealPrice[]> {
    return this.mealPriceService.findMealsPrices();
  }

  @Query(() => MealPrice, { nullable: true })
  async mealPrice(
    @Arg("id", () => ID) id: string
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
