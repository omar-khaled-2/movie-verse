# Movie-Verse Backend API

GraphQL API built with NestJS and Neo4j for managing movie data with complex relationships.

## 📋 Overview

This is the backend service for Movie-Verse, providing a GraphQL API for movie data management. It uses Neo4j graph database for efficient relationship queries and is built with NestJS for modularity and scalability.

## 🛠 Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **API**: GraphQL (Apollo Server 5.x)
- **Database**: Neo4j 6.x
- **Runtime**: Node.js 20
- **Package Manager**: npm/pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Neo4j database instance
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Application
PORT=3000
NODE_ENV=development

# Neo4j Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
```

### Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at:
- GraphQL Playground: `http://localhost:3000/graphql`
- API Endpoint: `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── actor/              # Actor module
│   │   ├── actor.model.ts      # Actor GraphQL model
│   │   ├── actor.resolver.ts   # GraphQL resolver
│   │   ├── actor.service.ts    # Business logic
│   │   └── actor.module.ts     # Module definition
│   │
│   ├── award/              # Award module
│   │   ├── award.model.ts
│   │   ├── award.resolver.ts
│   │   ├── award.service.ts
│   │   └── award.module.ts
│   │
│   ├── director/           # Director module
│   │   ├── director.model.ts
│   │   ├── director.resolver.ts
│   │   ├── director.service.ts
│   │   └── director.module.ts
│   │
│   ├── genre/              # Genre module
│   │   ├── genre.model.ts
│   │   ├── genre.resolver.ts
│   │   ├── genre.service.ts
│   │   └── genre.module.ts
│   │
│   ├── movie/              # Movie module
│   │   ├── movie.model.ts      # Movie GraphQL models
│   │   ├── movie.resolver.ts   # GraphQL resolver
│   │   ├── movies.service.ts   # Business logic
│   │   └── movie.module.ts     # Module definition
│   │
│   ├── neo4j/              # Neo4j integration
│   │   ├── neo4j.service.ts    # Neo4j service
│   │   └── neo4j.module.ts     # Neo4j module
│   │
│   ├── schemas.ts          # Shared GraphQL schemas
│   ├── app.controller.ts   # REST controller (health check)
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
│
├── dist/                   # Compiled output
├── node_modules/           # Dependencies
├── test/                   # E2E tests
├── .dockerignore          # Docker ignore rules
├── .env                    # Environment variables
├── .prettierrc            # Prettier configuration
├── Dockerfile             # Container definition
├── eslint.config.mjs      # ESLint configuration
├── nest-cli.json          # NestJS CLI config
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
└── tsconfig.build.json    # Build TypeScript config
```

## 📚 API Modules

### Movie Module

Handles movie CRUD operations and advanced features:

**Queries:**
- `movies(input?: GetMoviesInput)` - Get movies with optional filtering
- `movie(id: String!)` - Get a single movie by ID
- `similarMovies(movieId: String!)` - Find similar movies
- `recommendMovies(movieId: String!)` - Get movie recommendations

**Mutations:**
- `createMovie(input: CreateMovieInput!)` - Create a new movie

**Types:**
```graphql
type Movie {
  id: String!
  title: String!
  released: Int!
  rating: Float!
  budget: Float!
  boxOffice: Float!
  description: String!
  genres: [String!]!
  director: String
  actors: [String!]!
  awards: [String!]!
}
```

### Actor Module

Manages actor information and relationships:

**Queries:**
- `actors` - Get all actors
- `actor(id: String!)` - Get a single actor

**Types:**
```graphql
type Actor {
  id: String!
  name: String!
  movies: [Movie!]!
}
```

### Director Module

Handles director management:

**Queries:**
- `directors` - Get all directors
- `director(id: String!)` - Get a single director

**Types:**
```graphql
type Director {
  id: String!
  name: String!
  movies: [Movie!]!
}
```

### Genre Module

Manages movie genres:

**Queries:**
- `genres` - Get all genres
- `genre(name: String!)` - Get a genre

**Types:**
```graphql
type Genre {
  name: String!
  movies: [Movie!]!
}
```

### Award Module

Tracks movie awards:

**Queries:**
- `awards` - Get all awards
- `award(id: String!)` - Get an award

**Types:**
```graphql
type Award {
  id: String!
  name: String!
  movie: Movie
}
```

## 🔍 GraphQL Examples

### Get Movies with Filtering

```graphql
# Get movies by director
query {
  movies(input: { directorId: "christopher-nolan" }) {
    id
    title
    released
    rating
    genres
  }
}

# Get movies by actor
query {
  movies(input: { actorId: "leonardo-dicaprio" }) {
    id
    title
    rating
  }
}
```

### Find Similar Movies

```graphql
query {
  similarMovies(movieId: "inception") {
    id
    title
    sharedGenres
    sharedDirector
  }
}
```

### Get Movie Recommendations

```graphql
query {
  recommendMovies(movieId: "the-matrix") {
    id
    title
    similarityScore
  }
}
```

### Create a Movie

```graphql
mutation {
  createMovie(input: {
    title: "Interstellar"
    released: 2014
    rating: 8.6
    budget: 165000000
    boxOffice: 677463813
    description: "A team of explorers travel through a wormhole in space."
    genres: ["Adventure", "Drama", "Sci-Fi"]
    directorId: "christopher-nolan"
    actorIds: ["matthew-mcconaughey", "anne-hathaway"]
  }) {
    id
    title
    released
  }
}
```

## 🗄️ Database Schema

Neo4j graph database structure:

```cypher
# Nodes
(:Movie {id, title, released, rating, budget, boxOffice, description})
(:Actor {id, name})
(:Director {id, name})
(:Genre {name})
(:Award {id, name})

# Relationships
(:Movie)-[:ACTED_IN]->(:Actor)
(:Movie)-[:DIRECTED_BY]->(:Director)
(:Movie)-[:IN_GENRE]->(:Genre)
(:Movie)-[:WON_AWARD]->(:Award)
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Build

```bash
# Build for production
npm run build
```

Output will be in the `dist/` directory.

## 🐳 Docker

### Build Image

```bash
docker build -t movie-verse-backend:latest .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e NEO4J_URI=bolt://neo4j:7687 \
  -e NEO4J_USER=neo4j \
  -e NEO4J_PASSWORD=your-password \
  -e PORT=3000 \
  --name movie-verse-api \
  movie-verse-backend:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  neo4j:
    image: neo4j:latest
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/your-password
    volumes:
      - neo4j_data:/data

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=your-password
      - PORT=3000
    depends_on:
      - neo4j

volumes:
  neo4j_data:
```

## 📊 Performance

### Optimization Features

- **Graph Database**: Neo4j provides efficient relationship traversals
- **Connection Pooling**: Reuses database connections
- **GraphQL**: Clients request only needed data
- **Schema First**: Auto-generated GraphQL schema
- **TypeScript**: Type safety and better IDE support

### Resource Requirements

- **CPU**: 500m (0.5 cores) - 1 core
- **Memory**: 1Gi - 2Gi
- **Storage**: Depends on data size

## 🔐 Security

- Environment variables for sensitive data
- No credentials in code
- GraphQL query complexity limiting (configure as needed)
- Input validation with class-validator
- Neo4j parameterized queries (prevents injection)

## 🐛 Troubleshooting

### Common Issues

**Cannot connect to Neo4j:**
```bash
# Check Neo4j is running
docker ps | grep neo4j

# Verify connection string
echo $NEO4J_URI
```

**Port already in use:**
```bash
# Change port in .env
PORT=3001
```

**GraphQL playground not loading:**
```bash
# Ensure playground is enabled in app.module.ts
GraphQLModule.forRoot({
  playground: true,
})
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run start` | Start in normal mode |
| `npm run start:dev` | Start with hot-reload |
| `npm run start:prod` | Start production build |
| `npm run build` | Build for production |
| `npm run lint` | Lint code |
| `npm run format` | Format code |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |

## 🤝 Contributing

1. Follow NestJS best practices
2. Write tests for new features
3. Update documentation
4. Use conventional commits
5. Ensure all tests pass

## 📄 License

UNLICENSED

---

**Part of the Movie-Verse project**
