import { Injectable, Inject, OnApplicationShutdown,OnModuleInit } from '@nestjs/common';
import neo4j,{ Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  constructor(@Inject('NEO4J_DRIVER') private readonly driver: Driver) {}

  getWriteSession(): Session {
    return this.driver.session({
      defaultAccessMode: neo4j.session.WRITE,
    });
  }

  getReadSession(): Session {
    return this.driver.session({
      defaultAccessMode: neo4j.session.READ,
    });
  }

  async onApplicationShutdown() {
    await this.driver.close();
  }


  async ensureUniqueConstraint(label: string, property: string) {
    const session = this.getWriteSession();
    try {
      const check = await session.run(
        `
        SHOW CONSTRAINTS
        YIELD labelsOrTypes, properties
        WHERE labelsOrTypes = [$label] AND properties = [$property]
        RETURN labelsOrTypes
        `,
        { label, property }
      );

      if (check.records.length === 0) {
        const constraintName = `${label}_${property}_unique`;
        await session.run(
          `
          CREATE CONSTRAINT ${constraintName}
          FOR (n:${label})
          REQUIRE n.${property} IS UNIQUE
          `
        );
        console.log(`✅ Constraint created: ${label}.${property}`);
      } else {
        console.log(`✅ Constraint exists: ${label}.${property}`);
      }
    } finally {
      await session.close();
    }
  }
}
