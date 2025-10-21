import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Actor,
  ActorWithMovies,
  Collaboration,
  CreateActorInput,
  TopActor,
} from './actor.model';
import { ActorService } from './actor.service';

import { ActionResponse, CreationResponse } from 'src/schemas';

@Resolver(() => Actor)
export class ActorResolver {
  constructor(private readonly actorService: ActorService) {}

  @Query(() => [ActorWithMovies], { name: 'actors' })
  async getAll(): Promise<ActorWithMovies[]> {
    return this.actorService.getAll();
  }

  @Query(() => ActorWithMovies, { name: 'actor' })
  async getOne(@Args('id') id: string): Promise<ActorWithMovies> {
    return this.actorService.getOne(id);
  }


  @Query(() => [Collaboration], { name: 'actorCollaborations' })
  async getCollaborations(
    @Args('actorId') actorId: string,
  ): Promise<Collaboration[]> {
    return this.actorService.getCollaborations(actorId);
  }

  @Mutation(() => CreationResponse, { name: 'createActor' })
  async create(
    @Args('input') input: CreateActorInput,
  ): Promise<CreationResponse> {
    return this.actorService.create(input);
  }

  @Mutation(() => ActionResponse, { name: 'deleteActor' })
  async delete(@Args('id') id: string): Promise<ActionResponse> {
    return this.actorService.delete(id);
  }

  @Query(() => [TopActor], { name: 'topActors' })
  async getTopActors(): Promise<TopActor[]> {
    return this.actorService.getTopActors();
  }
}
