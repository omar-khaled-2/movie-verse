import { Injectable } from '@nestjs/common';
import {
  CreateDirectorInput,
  Director,
} from './director.model';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { ActionResponse, CreationResponse } from 'src/schemas';

@Injectable()
export class DirectorService {
  constructor(readonly neo4jService: Neo4jService) {}

  async getAll(): Promise<Director[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (d:Director)
        OPTIONAL MATCH (d)-[:DIRECTED]->(m:Movie)
        OPTIONAL MATCH (d)-[:WON_AWARD]->(aw:Award)
        WITH d, 
             COLLECT(DISTINCT m.title) as movies,
             COLLECT(DISTINCT aw.name + ' ' + aw.category + ' ' + toString(aw.year)) as awards
        RETURN d, movies, awards
        `,
      );

      return result.records.map((record) => {
        const directorProps = record.get('d').properties;
        return {
          id: directorProps.id,
          name: directorProps.name,
          birthdate: directorProps.birthdate || '',
          awards: record.get('awards').filter((a) => a) || [],
          movies: record.get('movies').filter((m) => m) || [],
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async getOne(id: string): Promise<Director> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (d:Director {id: $id})
        OPTIONAL MATCH (d)-[:WON_AWARD]->(aw:Award)
        OPTIONAL MATCH (d)-[:DIRECTED]->(m:Movie)
        WITH d, COLLECT(DISTINCT aw.name + ' ' + aw.category + ' ' + toString(aw.year)) as awards,
        COLLECT(DISTINCT m.title) as movies
        RETURN d, awards, movies
        `,
        { id },
      );

      const record = result.records[0];
      if (!record) throw new Error('Director not found');

      const directorProps = record.get('d').properties;
      return {
        id: directorProps.id,
        name: directorProps.name,
        birthdate: directorProps.birthdate || '',
        awards: record.get('awards'),
        movies: record.get('movies')
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async create(data: CreateDirectorInput): Promise<CreationResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
      const id = uuidv4();
      const { name, birthdate, awardIds } = data;

      await session.run(
        `
        CREATE (d:Director {
          id: $id,
          name: $name,
          birthdate: $birthdate
        })
        `,
        { id, name, birthdate},
      );
      for(const awardId of awardIds){

        await session.run(
        `
          MATCH (a:Director {id:$id})
          MATCH (aw:Award {id:$awardId})
          CREATE (a)-[:WON_AWARD]->(aw)
        `,
        { id, awardId },
      );
      }

      return {
        id,
        message: 'Director created successfully',
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
          MATCH (a:Director {id: $id})
          DETACH DELETE a
          `,
          { id },
        );
  
        return {
          message: 'Director deleted successfully',
        };
      } catch (error) {
        throw error;
      } finally {
        await session.close();
      }
    }

}
