import { Injectable } from '@nestjs/common';
import {
  CreateMovieInput,
  GetMoviesInput,
  Movie,
  MovieRecommendation,
  SimilarMovie,
} from './movie.model';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { Actor } from 'src/actor/actor.model';
import { ActionResponse, CreationResponse } from 'src/schemas';

@Injectable()
export class MovieService {
  constructor(readonly neo4jService: Neo4jService) {}

  async getAll(input?:GetMoviesInput): Promise<Movie[]> {
    const session = this.neo4jService.getReadSession();
    const {actorId,directorId} = input || {}
    try {
      const result = await session.run(
          `
          MATCH (m:Movie)
          OPTIONAL MATCH (m)-[:HAS_GENRE]->(g:Genre)
          OPTIONAL MATCH (d:Director)-[:DIRECTED]->(m)
          OPTIONAL MATCH (a:Actor)-[:ACTED_IN]->(m)
          OPTIONAL MATCH (m)-[:WON_AWARD]->(aw:Award)
          WHERE ($directorId IS NULL OR d.id = $directorId)
            AND ($actorId IS NULL OR a.id = $actorId)
          WITH m, 
              COLLECT(DISTINCT g.name) AS genres,
              d,
              COLLECT(DISTINCT a) AS actors,
              COLLECT(DISTINCT aw.name + ' ' + aw.category + ' ' + toString(aw.year)) AS awards

          


          
          RETURN m, genres, d.name AS director, [actor IN actors | actor.name] AS actors, awards
          `,
          {
            actorId: actorId ?? null,
            directorId: directorId ?? null
          }
        );


      const movies = result.records.map((record) => {
        const movieProps = record.get('m').properties;
        return {
          id: movieProps.id,
          title: movieProps.title,
          released: movieProps.released.toNumber ? movieProps.released.toNumber() : movieProps.released,
          rating: movieProps.rating,
          budget: movieProps.budget,
          boxOffice: movieProps.boxOffice,
          description: movieProps.description,
          genres: record.get('genres'),
          director: record.get('director'),
          actors: record.get('actors'),
          awards: record.get('awards'),
        };
      });
    
      return movies;
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async getOne(id: string): Promise<Movie> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (m:Movie {id: $id})
        OPTIONAL MATCH (m)-[:HAS_GENRE]->(g:Genre)
        OPTIONAL MATCH (d:Director)-[:DIRECTED]->(m)
        OPTIONAL MATCH (a:Actor)-[:ACTED_IN]->(m)
        OPTIONAL MATCH (m)-[:WON_AWARD]->(aw:Award)
        WITH m, 
             COLLECT(DISTINCT g.name) as genres,
             d.name as director,
             COLLECT(DISTINCT a.name) as actors,
             COLLECT(DISTINCT aw.name + ' ' + aw.category + ' ' + toString(aw.year)) as awards
        RETURN m, genres, director, actors, awards
        `,
        { id },
      );

      const record = result.records[0];
      if (!record) throw new Error('Movie not found');

      const movieProps = record.get('m').properties;
      return {
        id: movieProps.id,
        title: movieProps.title,
        released: movieProps.released.toNumber ? movieProps.released.toNumber() : movieProps.released,
        rating: movieProps.rating,
        budget: movieProps.budget,
        boxOffice: movieProps.boxOffice,
        description: movieProps.description,
        genres: record.get('genres') || [],
        director: record.get('director') || null,
        actors: record.get('actors') || [],
        awards: record.get('awards').filter((a) => a) || [],
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async create(data: CreateMovieInput): Promise<CreationResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
      const id = uuidv4();
      const {
        title,
        released,
        rating,
        budget,
        boxOffice,
        description,
        genres,
        directorId,
        actorIds,
      } = data;

      await session.run(
        `
        CREATE (m:Movie {
          id: $id,
          title: $title,
          released: $released,
          rating: $rating,
          budget: $budget,
          boxOffice: $boxOffice,
          description: $description
        })
        `,
        { id, title, released, rating, budget, boxOffice, description },
      );


      
      for (const genreName of genres) {

        const genreId = uuidv4()
        await session.run(
          `
          MATCH (m:Movie {id: $movieId})
          MERGE (g:Genre {name: $genreName})
          ON CREATE SET g.id = $genreId
          CREATE (m)-[:HAS_GENRE]->(g)
          `,
          { movieId: id, genreName,genreId },
        );
      }

      if(directorId){
        await session.run(
          `
            MATCH (m:Movie {id: $movieId})
            MATCH (d:Director {id: $directorId})
            CREATE (d)-[:DIRECTED]->(m)
          `,
          { movieId: id, directorId },
        );
      }

 

      for (const actorId of actorIds) {
        await session.run(
          `
          MATCH (m:Movie {id: $movieId})
          MATCH (a:Actor {id: $actorId})
          CREATE (a)-[:ACTED_IN]->(m)
          `,
          { movieId: id, actorId },
        );
      }
      

      return {
        id,
        message: 'Movie created successfully',
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }


  async delete(id: string): Promise<ActionResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
      await session.run(
        `
        MATCH (m:Movie {id: $id})
        DETACH DELETE m
        `,
        { id },
      );

      return {
        message: 'Movie deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getCast(movieId: string): Promise<Actor[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (a:Actor)-[:ACTED_IN]->(m:Movie {id: $movieId})
        OPTIONAL MATCH (a)-[:WON_AWARD]->(aw:Award)
        WITH a, COLLECT(DISTINCT aw.name + ' ' + aw.category + ' ' + toString(aw.year)) as awards
        RETURN a, awards
        `,
        { movieId },
      );

      return result.records.map((record) => {
        const actorProps = record.get('a').properties;
        return {
          id: actorProps.id,
          name: actorProps.name,
          birthdate: actorProps.birthdate || '',
          awards: record.get('awards').filter((a) => a) || [],
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async getSimilarMovies(movieId: string): Promise<SimilarMovie[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (m:Movie {id: $movieId})-[:HAS_GENRE]->(g:Genre)<-[:HAS_GENRE]-(similar:Movie)
        WHERE m.id <> similar.id
        OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Director)-[:DIRECTED]->(similar)
        WITH similar, 
             COLLECT(DISTINCT g.name) as sharedGenres,
             COUNT(DISTINCT d) > 0 as sharedDirector
        RETURN similar, sharedGenres, sharedDirector
        ORDER BY SIZE(sharedGenres) DESC, sharedDirector DESC
        LIMIT 10
        `,
        { movieId },
      );

      return result.records.map((record) => {
        const similarProps = record.get('similar').properties;
        return {
          id: similarProps.id,
          title: similarProps.title,
          sharedGenres: record.get('sharedGenres') || [],
          sharedDirector: record.get('sharedDirector'),
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

    async getRecommendationsByMovie(
    movieId: string,
  ): Promise<MovieRecommendation[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (m:Movie {id: $movieId})
        
        MATCH (m)-[:HAS_GENRE]->(g:Genre)<-[:HAS_GENRE]-(similar:Movie)
        WHERE m.id <> similar.id
        WITH m, similar, COUNT(DISTINCT g) as sharedGenres
        
        OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Director)-[:DIRECTED]->(similar)
        WITH m, similar, sharedGenres, COUNT(DISTINCT d) as sharedDirector
        

        OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Actor)-[:ACTED_IN]->(similar)
        WITH similar, sharedGenres, sharedDirector, COUNT(DISTINCT a) as sharedActors
        
        WITH similar, 
             (sharedGenres * 0.3 + sharedDirector * 0.4 + sharedActors * 0.1) as score
        
        RETURN similar.id as id, similar.title as title, score as similarityScore
        ORDER BY score DESC
        LIMIT 10
        `,
        { movieId },
      );

      return result.records.map((record) => ({
        id: record.get('id'),
        title: record.get('title'),
        similarityScore: record.get('similarityScore'),
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
}
