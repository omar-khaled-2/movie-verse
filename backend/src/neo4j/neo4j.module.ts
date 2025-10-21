import { Module, DynamicModule, Global, Provider, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver } from 'neo4j-driver';
import { Neo4jService } from './neo4j.service';


export interface Neo4jNodeOptions {
  label: string;
  uniqueProperty?: string;
}

async function ensureUniqueConstraint(label: string, property: string) {
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


@Global()
@Module({
 
})
export class Neo4jModule implements OnApplicationBootstrap {
  static nodes: Neo4jNodeOptions[] = [];

  constructor(private readonly neo4jService: Neo4jService) {}

  static forRoot(): DynamicModule {
    const driverProvider: Provider = {
      provide: 'NEO4J_DRIVER',
      useFactory: (configService: ConfigService): Driver => {
        const driver = neo4j.driver(
          configService.get<string>('NEO4J_URI')!,
          neo4j.auth.basic(
            configService.get<string>('NEO4J_USER')!,
            configService.get<string>('NEO4J_PASSWORD')!
          ),
        );

        driver.verifyConnectivity()
          .then(() => console.log('✅ Neo4j connected'))
          .catch(err => console.error('❌ Neo4j connection error', err));

        return driver;
      },
      inject: [ConfigService],
    };

    return {
      module: Neo4jModule,
      providers: [driverProvider, Neo4jService],
      exports: [driverProvider, Neo4jService],
      global: true,
    };
  }

  static forFeature(node: Neo4jNodeOptions): DynamicModule {
    this.nodes.push(node);
    
    const nodeProvider: Provider = {
      provide: `NEO4J_NODE_${node.label.toUpperCase()}`,
      useValue: node,

    };
  

    return {
      module: Neo4jModule,
      providers: [nodeProvider],
      exports: [nodeProvider],
      
      
    };
  }


  async onApplicationBootstrap() {
    for (const node of Neo4jModule.nodes) {
      if (node.uniqueProperty) {
        // await this.neo4jService.ensureUniqueConstraint(node.label, node.uniqueProperty);
      }
    }
  }
}
