import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorResolver } from './director.resolver';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [
    Neo4jModule.forFeature({ label: 'Director', uniqueProperty: 'id' }),
  ],
  providers: [DirectorService, DirectorResolver],
  exports: [DirectorService],
})
export class DirectorModule {}
