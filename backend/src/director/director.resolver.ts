import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateDirectorInput,
  Director,

} from './director.model';
import { DirectorService } from './director.service';

import { ActionResponse, CreationResponse } from 'src/schemas';

@Resolver(() => Director)
export class DirectorResolver {
  constructor(private readonly directorService: DirectorService) {}

  @Query(() => [Director], { name: 'directors' })
  async getAll(): Promise<Director[]> {
    return this.directorService.getAll();
  }

  @Query(() => Director, { name: 'director' })
  async getOne(@Args('id') id: string): Promise<Director> {
    return this.directorService.getOne(id);
  }

  @Mutation(() => CreationResponse, { name: 'createDirector' })
  async create(
    @Args('input') input: CreateDirectorInput,
  ): Promise<CreationResponse> {
    return this.directorService.create(input);
  }

  @Mutation(() => ActionResponse, { name: 'deleteDirector' })
  async delete(
    @Args('id') id: string,
  ): Promise<ActionResponse> {
    return this.directorService.delete(id);
  }
}
