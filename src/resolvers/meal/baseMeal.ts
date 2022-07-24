import { Meal } from "./meal.gql";

type BaseMeal = Omit<
  Meal,
  | "category"
  | "pictures"
  | "prices"
  | "averagePriceStudent"
  | "averagePriceNormal"
>;

export default BaseMeal;
