import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreResolver } from './genre.resolver';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule.forFeature({ label: 'Genre', uniqueProperty: 'name' })],
  providers: [GenreService, GenreResolver],
  exports: [GenreService],
})
export class GenreModule {}
