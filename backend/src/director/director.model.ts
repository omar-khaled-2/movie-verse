import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class Director {
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




@InputType()
export class CreateDirectorInput {
  @Field()
  name: string;

  @Field()
  birthdate: string;


  @Field(() => [String])
  awardIds: string[]
}



