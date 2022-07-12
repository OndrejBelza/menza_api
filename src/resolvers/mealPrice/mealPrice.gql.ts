import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Meal } from "../meal/meal.gql";
import { Restaurant } from "../restaurant/restaurant.gql";

@ObjectType()
export class MealPrice {
  @Field(() => ID)
  id: string;

  @Field(() => Meal, { nullable: true })
  meal?: Meal;

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field()
  priceStudent: number;

  @Field()
  priceRegular: number;

  @Field(() => Date)
  date: Date;
}

@InputType()
export class CreateMealPriceInput {
  @Field()
  priceStudent: number;

  @Field()
  priceRegular: number;

  @Field()
  date: Date;

  @Field(() => ID)
  restaurantId: string;

  @Field(() => ID)
  mealId: string;
}

@InputType()
export class UpdateMealPriceInput extends CreateMealPriceInput {
  @Field(() => ID)
  id: string;
}
