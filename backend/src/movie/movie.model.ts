
import { Field, ObjectType, Float, InputType, Int } from '@nestjs/graphql';


@InputType()
export class GetMoviesInput{

  @Field({ nullable: true })
  directorId?: string;

  @Field({ nullable: true })
  actorId?: string;
}

@ObjectType()
export class Movie {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  released: number;

  @Field(() => Float)
  rating: number;

  @Field(() => Float)
  budget: number;

  @Field(() => Float)
  boxOffice: number;

  @Field()
  description: string;

  @Field(() => [String])
  genres: string[];

  @Field({ nullable: true })
  director?: string;

  @Field(() => [String])
  actors: string[];

  @Field(() => [String])
  awards: string[];
}


@ObjectType()
export class SimilarMovie {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => [String])
  sharedGenres: string[];

  @Field()
  sharedDirector: boolean;
}


@InputType()
export class CreateMovieInput {
  @Field()
  title: string;

  @Field(() => Int)
  released: number;

  @Field(() => Float)
  rating: number;

  @Field(() => Float)
  budget: number;

  @Field(() => Float)
  boxOffice: number;

  @Field()
  description: string;

  @Field(() => [String])
  genres: string[];

  @Field({nullable:true})
  directorId?: string;

  @Field(() => [String])
  actorIds: string[];
}

@ObjectType()
export class MovieRecommendation {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => Float)
  similarityScore: number;
}