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
import BaseMealPrice from "../mealPrice/baseMealPrice";
import MealPriceService from "../mealPrice/mealPrice.service";
import BaseRestaurant from "./baseRestaurant";
import {
  CreateRestaurantInput,
  Restaurant,
  UpdateRestaurantInput,
} from "./restaurant.gql";
import RestaurantService from "./restaurant.service";

@Service()
@Resolver(Restaurant)
class RestaurantResolver {
  constructor(
    private restaurantService: RestaurantService,
    private mealPriceService: MealPriceService
  ) {}

  @FieldResolver()
  async mealPrices(
    @Root() restaurant: BaseRestaurant
  ): Promise<BaseMealPrice[]> {
    return this.mealPriceService.findRestaurantMealsPrices(restaurant.id);
  }

  @Query(() => [Restaurant])
  async restaurants(): Promise<BaseRestaurant[]> {
    return this.restaurantService.findRestaurants();
  }

  @Query(() => Restaurant, { nullable: true })
  async restaurant(
    @Arg("id", () => ID) id: string
  ): Promise<BaseRestaurant | null> {
    return this.restaurantService.findRestaurant(id);
  }

  @Mutation(() => Restaurant)
  @UseMiddleware(AdminGuard)
  async createRestaurant(
    @Arg("input", () => CreateRestaurantInput) input: CreateRestaurantInput
  ) {
    const { name, menuUrl } = input;
    return this.restaurantService.createRestaurant(name, menuUrl);
  }

  @Mutation(() => Restaurant)
  @UseMiddleware(AdminGuard)
  async deleteRestaurant(
    @Arg("id", () => ID) id: string
  ): Promise<BaseRestaurant> {
    return this.restaurantService.deleteRestaurant(id);
  }

  @Mutation(() => Restaurant)
  @UseMiddleware(AdminGuard)
  async updateRestaurant(
    @Arg("input", () => UpdateRestaurantInput) input: UpdateRestaurantInput
  ): Promise<BaseRestaurant> {
    const { id, name, menuUrl } = input;
    return this.restaurantService.updateRestaurant(id, name, menuUrl);
  }
}

export default RestaurantResolver;
