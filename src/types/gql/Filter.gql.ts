import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class Sort {
  @Field()
  by: string;

  @Field({ nullable: true })
  order?: string;
}
