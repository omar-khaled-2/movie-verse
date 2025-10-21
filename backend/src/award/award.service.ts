import { Injectable } from '@nestjs/common';
import { Award, CreateAwardInput, WinAwardInput, Winner } from './award.model';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';

import { ActionResponse, CreationResponse } from 'src/schemas';

@Injectable()
export class AwardService {
  constructor(readonly neo4jService: Neo4jService) {}

  async create(data: CreateAwardInput): Promise<CreationResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
      const id = uuidv4();
      const { name, year, category } = data;

      await session.run(
        `
        CREATE (aw:Award {
          id: $id,
          name: $name,
          year: $year,
          category: $category
        })
        `,
        { id, name, year, category },
      );

      return {
        id,
        message: 'Award created successfully',
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }


  async win(data: WinAwardInput): Promise<ActionResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
   
      const { awardId,winnerId } = data;

      await session.run(
        `
        MATCH (a)
        WHERE a.id = $winnerId AND ANY(label IN labels(a) WHERE label IN ['Actor', 'Director', 'Movie'])
        MATCH (aw:Award {id:$id})
        CREATE (a)-[:WON_AWARD]->(aw)
        `,
        { id:awardId, winnerId },
      );

      return {
        message: 'Award created successfully',
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
  async getAll(): Promise<Award[]> {
    const session = this.neo4jService.getReadSession();

    try {

      const result = await session.run(
        `
          MATCH(aw:Award)
          return aw
        `
      );
      return result.records.map((record) => {
        const awardProps = record.get('aw').properties;
    
        return {
          id: awardProps.id,
          name: awardProps.name,
          year: awardProps.year,
          category: awardProps.category
        };
      });

    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async getWinners(awardId: string): Promise<Winner[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (aw:Award {id: $awardId})
        OPTIONAL MATCH (a:Actor)-[:WON_AWARD]->(aw)
        OPTIONAL MATCH (d:Director)-[:WON_AWARD]->(aw)
        OPTIONAL MATCH (m:Movie)-[:WON_AWARD]->(aw)
        WITH aw,
             COLLECT(DISTINCT {type: 'Actor', name: a.name}) as actors,
             COLLECT(DISTINCT {type: 'Director', name: d.name}) as directors,
             COLLECT(DISTINCT {type: 'Movie', name: m.title}) as movies
        RETURN actors, directors, movies
        `,
        { awardId },
      );

      if (result.records.length === 0) {
        return [];
      }

      const record = result.records[0];
      const winners: Winner[] = [];

      const actors = record.get('actors');
      const directors = record.get('directors');
      const movies = record.get('movies');

      actors.forEach((actor) => {
        if (actor.name) {
          winners.push({
            type: 'Actor',
            name: actor.name,
          });
        }
      });

      directors.forEach((director) => {
        if (director.name) {
          winners.push({
            type: 'Director',
            name: director.name,
          });
        }
      });

      movies.forEach((movie) => {
        if (movie.name) {
          winners.push({
            type: 'Movie',
            name: movie.name,
          });
        }
      });

      return winners;
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
}
