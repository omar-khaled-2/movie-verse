import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class Genre {
  @Field()
  id: string;

  @Field()
  name: string;
}

@InputType()
export class CreateGenreInput {
  @Field()
  name: string;
}
