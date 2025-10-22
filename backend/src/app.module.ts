import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { MovieModule } from './movie/movie.module';
import { ActorModule } from './actor/actor.module';
import { DirectorModule } from './director/director.module';
import { GenreModule } from './genre/genre.module';
import { AwardModule } from './award/award.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
    }),
    Neo4jModule.forRoot(),
    MovieModule,
    ActorModule,
    DirectorModule,
    GenreModule,
    AwardModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
