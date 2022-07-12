import { Restaurant } from "./restaurant.gql";

type BaseRestaurant = Omit<Restaurant, "mealPrices">;

export default BaseRestaurant;
