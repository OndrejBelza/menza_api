import { Field, InputType } from "type-graphql";

@InputType()
export class Sort {
  @Field()
  by: string;

  @Field({ nullable: true })
  order?: string;
}
