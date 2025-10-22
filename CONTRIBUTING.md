# Contributing to Movie-Verse

Thank you for considering contributing to Movie-Verse! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Neo4j database
- Git
- AWS CLI (for infrastructure changes)
- Terraform (for infrastructure changes)
- kubectl (for Kubernetes changes)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/movie-verse.git
   cd movie-verse
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/movie-verse.git
   ```

### Set Up Development Environment

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start Neo4j database:
   ```bash
   docker run -d \
     --name neo4j \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/your-password \
     neo4j:latest
   ```

4. Run the application:
   ```bash
   npm run start:dev
   ```

## 💻 Development Process

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow the project's coding standards
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Check code coverage
npm run test:cov

# Lint your code
npm run lint

# Format code
npm run format
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

See [Commit Messages](#commit-messages) section for guidelines.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code follows project style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### Submitting a Pull Request

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:
   - Clear description of changes
   - Reference any related issues
   - Screenshots (if UI changes)
   - Testing steps

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## 📝 Coding Standards

### TypeScript Style Guide

#### General

- Use TypeScript strict mode
- Enable all strict type checking options
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs

#### Naming Conventions

```typescript
// Classes: PascalCase
class MovieService {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IMovie {}
interface Movie {} // Also acceptable

// Types: PascalCase
type MovieType = {};

// Functions and methods: camelCase
function getMovies() {}

// Variables: camelCase
const movieTitle = "Inception";

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Private properties: prefix with underscore
private _internalState = {};

// Enums: PascalCase (keys and values)
enum MovieGenre {
  Action = "Action",
  Drama = "Drama",
}
```

#### Code Organization

```typescript
// 1. Imports (grouped)
import { Injectable } from '@nestjs/common';
import { Movie } from './movie.model';

// 2. Types/Interfaces
interface MovieQuery {
  title?: string;
}

// 3. Constants
const DEFAULT_PAGE_SIZE = 10;

// 4. Class/Function definition
@Injectable()
export class MovieService {
  // 4.1. Properties
  private readonly logger: Logger;

  // 4.2. Constructor
  constructor() {}

  // 4.3. Public methods
  public getMovies() {}

  // 4.4. Private methods
  private validateMovie() {}
}
```

### NestJS Conventions

```typescript
// Use decorators appropriately
@Injectable()
export class MovieService {
  constructor(
    @Inject(NEO4J_SERVICE) private neo4j: Neo4jService,
  ) {}
}

// Use DTOs for data transfer
export class CreateMovieDto {
  @IsString()
  title: string;

  @IsNumber()
  released: number;
}

// Use Pipes for validation
@Post()
createMovie(@Body(ValidationPipe) dto: CreateMovieDto) {}

// Use Guards for authorization
@UseGuards(AuthGuard)
@Get()
getProtectedResource() {}
```

### GraphQL Conventions

```typescript
// Use decorators for schema
@ObjectType()
export class Movie {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => [String])
  genres: string[];
}

// Use InputType for mutations
@InputType()
export class CreateMovieInput {
  @Field()
  title: string;
}

// Resolver structure
@Resolver(() => Movie)
export class MovieResolver {
  @Query(() => [Movie])
  movies() {}

  @Mutation(() => Movie)
  createMovie(@Args('input') input: CreateMovieInput) {}
}
```

### Error Handling

```typescript
// Use NestJS exceptions
throw new NotFoundException('Movie not found');
throw new BadRequestException('Invalid input');

// Custom exceptions
export class MovieNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Movie with ID ${id} not found`);
  }
}

// Try-catch for external services
try {
  await this.externalService.call();
} catch (error) {
  this.logger.error('External service failed', error);
  throw new ServiceUnavailableException();
}
```

## 📋 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)

### Examples

```bash
# Feature
git commit -m "feat(movie): add movie recommendation feature"

# Bug fix
git commit -m "fix(api): resolve null pointer in movie query"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(service): simplify movie search logic"

# Breaking change
git commit -m "feat(api)!: change movie response structure

BREAKING CHANGE: Movie API now returns nested genre objects instead of strings"
```

### Best Practices

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep subject under 50 characters
- Provide detailed body if needed
- Reference issues in footer

## 🧪 Testing

### Test Structure

```typescript
describe('MovieService', () => {
  let service: MovieService;
  let neo4j: Neo4jService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MovieService, mockNeo4jProvider],
    }).compile();

    service = module.get<MovieService>(MovieService);
    neo4j = module.get<Neo4jService>(NEO4J_SERVICE);
  });

  describe('getMovies', () => {
    it('should return array of movies', async () => {
      // Arrange
      const mockMovies = [{ id: '1', title: 'Test' }];
      jest.spyOn(neo4j, 'read').mockResolvedValue(mockMovies);

      // Act
      const result = await service.getMovies();

      // Assert
      expect(result).toEqual(mockMovies);
    });
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test happy paths
- Test error cases
- Test edge cases
- Mock external dependencies

### Running Tests

```bash
# All tests
npm run test

# Specific file
npm run test -- movie.service.spec.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Retrieves movies from the database with optional filtering
 *
 * @param input - Optional filter criteria
 * @returns Promise resolving to array of movies
 * @throws {NotFoundException} When no movies match the criteria
 *
 * @example
 * ```typescript
 * const movies = await service.getMovies({ directorId: '123' });
 * ```
 */
async getMovies(input?: GetMoviesInput): Promise<Movie[]> {
  // Implementation
}
```

### README Updates

When adding features:
1. Update main README.md
2. Update module-specific READMEs
3. Add API examples
4. Update architecture diagrams if needed

### API Documentation

- Keep GraphQL schema documented
- Add description to fields
- Provide query/mutation examples
- Document error responses

## 🔍 Code Review

### As a Contributor

- Respond to feedback promptly
- Be open to suggestions
- Ask questions if unclear
- Update PR based on feedback

### As a Reviewer

- Be respectful and constructive
- Explain reasoning for changes
- Approve when ready
- Thank contributors

## ❓ Questions?

- Open an issue for questions
- Join our community discussions
- Check existing documentation
- Ask in pull request comments

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- Project documentation

Thank you for contributing to Movie-Verse! 🎬

---

**Happy Coding!** 🚀
