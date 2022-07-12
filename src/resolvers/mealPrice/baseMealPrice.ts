import { MealPrice } from "./mealPrice.gql";

type BaseMealPrice = Omit<MealPrice, "meal" | "restaurant">;

export default BaseMealPrice;
