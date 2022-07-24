import { UUIDResolver } from "graphql-scalars";
import { Field, InputType, ObjectType } from "type-graphql";
import { Category } from "../category/category.gql";
import { MealPicture } from "../mealPicture/mealPicture.gql";
import { MealPrice } from "../mealPrice/mealPrice.gql";

@InputType()
export class MealFilter {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
export class Meal {
  @Field(() => UUIDResolver)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [MealPicture])
  pictures: MealPicture[];

  @Field(() => [MealPrice])
  prices: MealPrice[];

  @Field()
  averagePriceStudent: number;

  @Field()
  averagePriceNormal: number;
}

@ObjectType()
export class MealOption {
  @Field()
  name: string;

  @Field(() => UUIDResolver)
  id: string;
}

@InputType()
export class CreateMealInput {
  @Field()
  name: string;

  @Field(() => UUIDResolver)
  categoryId: string;
}

@InputType()
export class UpdateMealInput {
  @Field(() => UUIDResolver)
  id: string;

  @Field()
  name: string;

  @Field(() => UUIDResolver)
  categoryId: string;
}
