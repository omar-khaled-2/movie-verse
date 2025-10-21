import { Module } from '@nestjs/common';
import { MovieService } from './movies.service';
import { MovieResolver } from './movie.resolver';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
    imports:[
        Neo4jModule.forFeature({label:"Movie",uniqueProperty:"id"}),
        
    ],
    providers: [MovieService, MovieResolver],
})
export class MovieModule {}
