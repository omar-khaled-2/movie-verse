import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateGenreInput, Genre } from './genre.model';
import { GenreService } from './genre.service';
import { CreationResponse } from 'src/schemas';

@Resolver(() => Genre)
export class GenreResolver {
  constructor(private readonly genreService: GenreService) {}

  @Query(() => [Genre], { name: 'genres' })
  async getAll(): Promise<Genre[]> {
    return this.genreService.getAll();
  }

  @Mutation(() => CreationResponse, { name: 'createGenre' })
  async create(
    @Args('input') input: CreateGenreInput,
  ): Promise<CreationResponse> {
    return this.genreService.create(input);
  }
}
