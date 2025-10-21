import { Injectable } from '@nestjs/common';
import { CreateGenreInput, Genre } from './genre.model';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { CreationResponse } from 'src/schemas';

@Injectable()
export class GenreService {
  constructor(readonly neo4jService: Neo4jService) {}

  async create(data: CreateGenreInput): Promise<CreationResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
      let id = uuidv4();
      const { name } = data;

      const result = await session.run(
        `
        MERGE (g:Genre {
          name: $name
        })
          ON CREATE SET g.id = $id
          RETURN g.id AS id
        `,
        { id, name },
      );

      id = result.records[0].get("id")

      return {
        id,
        message: 'Genre created successfully',
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }



  async getAll(): Promise<Genre[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (g:Genre)
        RETURN g
        `
      );

      return result.records.map((record) => {
        const genreProps = record.get('g').properties;
        return {
          id: genreProps.id,
          name: genreProps.name
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

}
