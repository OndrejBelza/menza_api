import { Category } from "./category.gql";

type BaseCategory = Omit<Category, "meals">;

export default BaseCategory;
