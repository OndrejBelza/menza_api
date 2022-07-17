import { UUIDResolver } from "graphql-scalars";
import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import RestaurantLoader from "../../dataloaders/restaurantLoader";
import BaseMealPrice from "../mealPrice/baseMealPrice";
import MealPriceService from "../mealPrice/mealPrice.service";
import BaseRestaurant from "../restaurant/baseRestaurant";
import BaseMenu from "./baseMenu";
import { Menu } from "./menu.gql";

@Service()
@Resolver(Menu)
export class MenuResolver {
  constructor(
    private restaurantLoader: RestaurantLoader,
    private mealPriceService: MealPriceService
  ) {}

  @FieldResolver()
  async restaurant(
    @Root() menu: BaseMenu
  ): Promise<BaseRestaurant | undefined> {
    return this.restaurantLoader.load(menu.restaurantId);
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
    @Arg("restaurantId", () => UUIDResolver) restaurantId: string,
    @Arg("date") date: Date
  ): Promise<BaseMenu> {
    return {
      date,
      restaurantId,
    };
  }
}
