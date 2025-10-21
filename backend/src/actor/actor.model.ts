import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class Actor {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  birthdate: string;

  @Field(() => [String])
  awards: string[];
}

@ObjectType()
export class ActorWithMovies {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  birthdate: string;

  @Field(() => [String])
  awards: string[];

  @Field(() => [String])
  movies: string[];
}

@ObjectType()
export class Collaboration {
  @Field()
  actorId: string;

  @Field()
  actorName: string;

  @Field(() => [String])
  moviesTogether: string[];
}

@InputType()
export class CreateActorInput {
  @Field()
  name: string;

  @Field()
  birthdate: string;

  @Field(() => [String])
  awardIds: string[]
}


@ObjectType()
export class TopActor {
  @Field()
  name: string;

  @Field(() => Int)
  movieCount: number;

  @Field(() => Int)
  awardCount: number;
}