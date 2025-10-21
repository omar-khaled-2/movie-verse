import { Injectable } from '@nestjs/common';
import {
  Actor,
  ActorWithMovies,
  Collaboration,
  CreateActorInput,
  TopActor,
} from './actor.model';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';

import { ActionResponse, CreationResponse } from 'src/schemas';

@Injectable()
export class ActorService {
  constructor(readonly neo4jService: Neo4jService) {}

  async getAll(): Promise<ActorWithMovies[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (a:Actor)
        OPTIONAL MATCH (a)-[:ACTED_IN]->(m:Movie)
        OPTIONAL MATCH (a)-[:WON_AWARD]->(aw:Award)
        WITH a, 
             COLLECT(m.title) as movies,
             COLLECT(aw.name + ' ' + aw.category + ' ' + aw.year) as awards
        RETURN a, movies, awards
        `,
      );

      return result.records.map((record) => {
        const actorProps = record.get('a').properties;
        return {
          id: actorProps.id,
          name: actorProps.name,
          birthdate: actorProps.birthdate,
          awards: record.get('awards'),
          movies: record.get('movies'),
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async getOne(id: string): Promise<ActorWithMovies> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (a:Actor {id: $id})
        OPTIONAL MATCH (a)-[:WON_AWARD]->(aw:Award)
        OPTIONAL MATCH (a)-[:ACTED_IN]->(m:Movie)
        WITH a,
        COLLECT(aw.name + ' ' + aw.category + ' ' + toString(aw.year)) as awards,
        COLLECT(m.title) as movies
        RETURN a, awards, movies
        `,
        { id },
      );

      const record = result.records[0];
      if (!record) throw new Error('Actor not found');

      const actorProps = record.get('a').properties;
  
      return {
        id: actorProps.id,
        name: actorProps.name,
        birthdate: actorProps.birthdate,
        awards: record.get('awards'),
        movies: record.get('movies')
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  async create(data: CreateActorInput): Promise<CreationResponse> {
    const session = this.neo4jService.getWriteSession();

    try {
      const id = uuidv4();
      const { name, birthdate,awardIds } = data;
 
      await session.run(
        `
        CREATE (a:Actor {
          id: $id,
          name: $name,
          birthdate: $birthdate
        })
        `,
        { id, name, birthdate },
      );

      for(const awardId of awardIds){

        await session.run(
        `
          MATCH (a:Actor {id:$id})
          MATCH (aw:Award {id:$awardId})
          CREATE (a)-[:WON_AWARD]->(aw)
        `,
        { id, awardId },
      );

      }

      return {
        id,
        message: 'Actor created successfully',
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
        MATCH (a:Actor {id: $id})
        DETACH DELETE a
        `,
        { id },
      );

      return {
        message: 'Actor deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await session.close();
    }
  }


  async getCollaborations(actorId: string): Promise<Collaboration[]> {
    const session = this.neo4jService.getReadSession();

    try {
      const result = await session.run(
        `
        MATCH (a:Actor {id: $actorId})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(coActor:Actor)
        WHERE a.id <> coActor.id
        WITH coActor, COLLECT(DISTINCT m.title) as movies
        RETURN coActor, movies
        ORDER BY SIZE(movies) DESC
        `,
        { actorId },
      );

      return result.records.map((record) => {
        const coActorProps = record.get('coActor').properties;
        return {
          actorId: coActorProps.id,
          actorName: coActorProps.name,
          moviesTogether: record.get('movies') || [],
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }



  async getTopActors(): Promise<TopActor[]> {
      const session = this.neo4jService.getReadSession();
  
      try {
        const result = await session.run(
          `
          MATCH (a:Actor)
          OPTIONAL MATCH (a)-[:ACTED_IN]->(m:Movie)
          OPTIONAL MATCH (a)-[:WON_AWARD]->(aw:Award)
          WITH a, COUNT(DISTINCT m) as movieCount, COUNT(DISTINCT aw) as awardCount
          RETURN a.name as name, movieCount, awardCount
          ORDER BY movieCount DESC, awardCount DESC
          LIMIT 20
          `,
        );
  
        return result.records.map((record) => ({
          name: record.get('name'),
          movieCount: record.get('movieCount').toNumber
            ? record.get('movieCount').toNumber()
            : record.get('movieCount'),
          awardCount: record.get('awardCount').toNumber
            ? record.get('awardCount').toNumber()
            : record.get('awardCount'),
        }));
      } catch (error) {
        throw error;
      } finally {
        await session.close();
      }
    }
}
