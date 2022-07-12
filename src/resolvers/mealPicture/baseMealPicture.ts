import { MealPicture } from "./mealPicture.gql";

type BaseMealPicture = Omit<MealPicture, "meal" | "restaurant">;

export default BaseMealPicture;
