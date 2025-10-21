import { Module, OnModuleInit } from '@nestjs/common';
import { ActorService } from './actor.service';
import { ActorResolver } from './actor.resolver';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [
    Neo4jModule.forFeature({ label: 'Actor', uniqueProperty: 'id' }),
  ],
  providers: [ActorService, ActorResolver],
})
export class ActorModule {}
