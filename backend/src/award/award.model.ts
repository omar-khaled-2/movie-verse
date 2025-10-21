import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class Award {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  year: number;

  @Field()
  category: string;
}

@ObjectType()
export class Winner {
  @Field()
  type: string;

  @Field()
  name: string;

}

@InputType()
export class CreateAwardInput {
  @Field()
  name: string;

  @Field(() => Int)
  year: number;

  @Field()
  category: string;
}


@InputType()
export class WinAwardInput {
  @Field()
  winnerId: string;

  @Field()
  awardId: string;
}
