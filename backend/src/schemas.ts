import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CreationResponse {
  @Field()
  id: string;

  @Field()
  message: string;
}


@ObjectType()
export class ActionResponse {
  @Field()
  message: string;
}




