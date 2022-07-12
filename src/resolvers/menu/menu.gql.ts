import { Field, ObjectType } from "type-graphql";
import { MealPrice } from "../mealPrice/mealPrice.gql";
import { Restaurant } from "../restaurant/restaurant.gql";

@ObjectType()
export class Menu {
  @Field(() => Date)
  date: Date;

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field(() => [MealPrice])
  mealPrices: MealPrice[];
}
