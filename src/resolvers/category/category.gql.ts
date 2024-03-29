import { UUIDResolver } from "graphql-scalars";
import { Field, InputType, ObjectType } from "type-graphql";
import { Meal } from "../meal/meal.gql";

@ObjectType()
export class Category {
  @Field(() => UUIDResolver)
  id: string;

  @Field()
  name: string;

  @Field(() => [Meal])
  meals: Meal[];
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => UUIDResolver)
  id: string;

  @Field()
  name: string;
}
