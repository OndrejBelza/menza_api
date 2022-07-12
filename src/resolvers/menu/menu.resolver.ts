import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import BaseMealPrice from "../mealPrice/baseMealPrice";
import MealPriceService from "../mealPrice/mealPrice.service";
import BaseRestaurant from "../restaurant/baseRestaurant";
import RestaurantService from "../restaurant/restaurant.service";
import BaseMenu from "./baseMenu";
import { Menu } from "./menu.gql";

@Service()
@Resolver(Menu)
export class MenuResolver {
  constructor(
    private restaurantService: RestaurantService,
    private mealPriceService: MealPriceService
  ) {}

  @FieldResolver()
  async restaurant(@Root() menu: BaseMenu): Promise<BaseRestaurant | null> {
    return this.restaurantService.findRestaurant(menu.restaurantId);
  }

  @FieldResolver()
  async mealPrices(@Root() menu: BaseMenu): Promise<BaseMealPrice[]> {
    return this.mealPriceService.findRestaurantMealsPricesForDate(
      menu.restaurantId,
      menu.date
    );
  }

  @Query(() => Menu)
  async menu(
    @Arg("restaurantId") restaurantId: string,
    @Arg("date") date: Date
  ): Promise<BaseMenu> {
    return {
      date,
      restaurantId,
    };
  }
}
