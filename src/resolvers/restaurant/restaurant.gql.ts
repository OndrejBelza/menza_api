import { Field, ID, InputType, ObjectType } from "type-graphql";
import { MealPrice } from "../mealPrice/mealPrice.gql";

@ObjectType()
export class Restaurant {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  menuUrl: string;

  @Field()
  scrape: boolean;

  @Field(() => [MealPrice])
  mealPrices: MealPrice[];
}

@InputType()
export class CreateRestaurantInput {
  @Field()
  name: string;

  @Field()
  menuUrl: string;
}

@InputType()
export class UpdateRestaurantInput {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  menuUrl: string;
}
