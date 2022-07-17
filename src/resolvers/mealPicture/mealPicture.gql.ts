import { UUIDResolver } from "graphql-scalars";
import { Field, InputType, ObjectType } from "type-graphql";
import { Meal } from "../meal/meal.gql";
import { Restaurant } from "../restaurant/restaurant.gql";

@ObjectType()
export class MealPicture {
  @Field(() => UUIDResolver)
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

  @Field(() => UUIDResolver)
  mealId: string;

  @Field(() => UUIDResolver)
  restaurantId: string;
}

@InputType()
export class UpdateMealPictureInput extends CreateMealPictureInput {
  @Field(() => UUIDResolver)
  id: string;
}
