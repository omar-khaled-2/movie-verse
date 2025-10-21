import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateMovieInput,
  GetMoviesInput,
  Movie,

  MovieRecommendation,

  SimilarMovie,

} from './movie.model';
import { MovieService } from './movies.service';
import { Actor } from 'src/actor/actor.model';
import { ActionResponse, CreationResponse } from 'src/schemas';

@Resolver(() => Movie)
export class MovieResolver {
  constructor(private readonly movieService: MovieService) {}

  @Query(() => [Movie], { name: 'movies' })
  async getAll(  @Args('input',{nullable:true}) input?: GetMoviesInput): Promise<Movie[]> {
    return this.movieService.getAll(input);
  }

  @Query(() => Movie, { name: 'movie' })
  async getOne(@Args('id') id: string): Promise<Movie> {
    return this.movieService.getOne(id);
  }

  @Query(() => [Actor], { name: 'movieCast' })
  async getCast(@Args('movieId') movieId: string): Promise<Actor[]> {
    return this.movieService.getCast(movieId);
  }

  @Query(() => [SimilarMovie], { name: 'similarMovies' })
  async getSimilarMovies(
    @Args('movieId') movieId: string,
  ): Promise<SimilarMovie[]> {
    return this.movieService.getSimilarMovies(movieId);
  }

  @Mutation(() => CreationResponse, { name: 'createMovie' })
  async create(
    @Args('input') input: CreateMovieInput,
  ): Promise<CreationResponse> {
    return this.movieService.create(input);
  }



  @Mutation(() => ActionResponse, { name: 'deleteMovie' })
  async delete(@Args('id') id: string): Promise<ActionResponse> {
    return this.movieService.delete(id);
  }

  @Query(() => [MovieRecommendation], { name: 'recommendationsByMovie' })
  async getRecommendationsByMovie(
    @Args('movieId') movieId: string,
  ): Promise<MovieRecommendation[]> {
    return this.movieService.getRecommendationsByMovie(movieId);
  }
}