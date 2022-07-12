import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Category } from "../category/category.gql";
import { MealPicture } from "../mealPicture/mealPicture.gql";
import { MealPrice } from "../mealPrice/mealPrice.gql";

@ObjectType()
export class Meal {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [MealPicture])
  pictures: MealPicture[];

  @Field(() => [MealPrice])
  prices: MealPrice[];
}

@ObjectType()
export class MealOption {
  @Field()
  name: string;

  @Field(() => ID)
  id: string;
}

@InputType()
export class CreateMealInput {
  @Field()
  name: string;

  @Field(() => ID)
  categoryId: string;
}

@InputType()
export class UpdateMealInput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID)
  categoryId: string;
}
