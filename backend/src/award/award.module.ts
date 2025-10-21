import { Module } from '@nestjs/common';
import { AwardService } from './award.service';
import { AwardResolver } from './award.resolver';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule.forFeature({ label: 'Award', uniqueProperty: 'id' })],
  providers: [AwardService, AwardResolver],
  exports: [AwardService],
})
export class AwardModule {}
