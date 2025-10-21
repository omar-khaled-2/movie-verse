import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Award, CreateAwardInput, WinAwardInput, Winner } from './award.model';
import { AwardService } from './award.service';
import { ActionResponse, CreationResponse } from 'src/schemas';


@Resolver(() => Award)
export class AwardResolver {
  constructor(private readonly awardService: AwardService) {}

  @Query(() => [Winner], { name: 'awardWinners' })
  async getWinners(@Args('awardId') awardId: string): Promise<Winner[]> {
    return this.awardService.getWinners(awardId);
  }

  @Mutation(() => CreationResponse, { name: 'createAward' })
  async create(
    @Args('input') input: CreateAwardInput,
  ): Promise<CreationResponse> {
    return this.awardService.create(input);
  }

  @Mutation(() => ActionResponse, { name: 'winAward' })
  async win(
    @Args('input') input: WinAwardInput,
  ): Promise<ActionResponse> {
    return this.awardService.win(input);
  }

  @Query(() => [Award], { name: 'awards' })
  async getAll(): Promise<Award[]> {
    return this.awardService.getAll();
  }
}
