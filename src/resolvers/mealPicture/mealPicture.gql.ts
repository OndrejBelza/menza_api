import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Meal } from "../meal/meal.gql";
import { Restaurant } from "../restaurant/restaurant.gql";

@ObjectType()
export class MealPicture {
  @Field(() => ID)
  id: string;

  @Field()
  img: string;

  @Field(() => Meal, { nullable: true })
  meal?: Meal;

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}

@InputType()
export class CreateMealPictureInput {
  @Field()
  img: string;

  @Field(() => ID)
  mealId: string;

  @Field(() => ID)
  restaurantId: string;
}

@InputType()
export class UpdateMealPictureInput extends CreateMealPictureInput {
  @Field(() => ID)
  id: string;
}
