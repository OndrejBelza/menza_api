import { Meal } from "./meal.gql";

type BaseMeal = Omit<Meal, "category" | "pictures" | "prices">;

export default BaseMeal;
