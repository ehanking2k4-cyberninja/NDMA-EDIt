# NDMA Cloud Backend

**The backend of NDMA CLOUD** — Contains all APIs, business logic, data persistence, and third-party integrations.

## Table of Contents

- [Overview](#overview)
- [Migration (src/ → ndma-cloud/)](#migration-src--ndma-cloud) *(temporary)*
- [Project Structure](#project-structure)
  - [.github](#github)
  - [ndma-cloud](#ndma-cloud)
    - [config](#config)
    - [infrastructure](#infrastructure)
      - [workers](#workers)
  - [Docker](#docker)
- [Quick Start](#quick-start)
- [Style Guide](#style-guide)

## Migration (src/ → ndma-cloud/) *(temporary)*

We are migrating code from `src/` to `ndma-cloud/`. This keeps a clear separation between legacy and cleaned code. *This README is not the final version and is still being worked on; information here may change.*

- **`src/`** — Legacy code. May contain bugs and technical debt.
- **`ndma-cloud/`** — Will eventually have all logic from `src/` but cleaned of any bugs, with tests, refactored and with updated code structure.

### Migration rules

1. **`ndma-cloud/` must never depend on `src/`.** Nothing from `src/` may be imported in `ndma-cloud/` logic.
2. **`src/` may import from `ndma-cloud/` during the migration.** Legacy code can use migrated modules while we transition.
3. **`ndma-cloud/` logic must have tests.** All code under `ndma-cloud/` must be covered by tests.
4. **MyPy must pass for `ndma-cloud/`.** mypy must not report any errors for code under `ndma-cloud/`.

This section will be removed once the migration is complete.

## Project Structure

This section documents the ndma-cloud backend directory structure and what each part is for.

### .github

```
backend
├── .github/
│   ├── CODEOWNERS
│   └── workflows/
│       └── build-backend-acr.yml
└── ...
```

- `.github/`: GitHub repository configuration—workflows, code ownership, and other GitHub-specific settings.
- `.github/CODEOWNERS`: Defines who owns the codebase for review and notification purposes.
- `.github/workflows/`: Contains GitHub Actions workflow definitions for CI/CD pipelines.
- `.github/workflows/build-backend-acr.yml`: Builds the backend Docker image and pushes it to Local Registry .

### NDMA CLOUD

```
backend
├── ...
└── ndma-cloud/
    ├── config/
    └── infrastructure/
```

- `ndma-cloud/`: Main folder for all application-specific logic (business, infrastructure, etc.).
- `ndma-cloud/config/`: All application settings, loaded from environment variables and `.env` files using pydantic-settings.
- `ndma-cloud/infrastructure/`: Configuration for services (databases, worker frameworks, and other external services).

#### config

```

backend
├── ...
└── ndma-cloud/
    └── config/
        ├── __init__.py
        ├── base.py
        ├── celery.py
        └── settings.py
```

- `ndma-cloud/config/base.py`: Base settings class that all sub-configurations inherit.
- `ndma-cloud/config/celery.py`: Celery worker settings, RabbitMQ broker, and RedBeat.
- `ndma-cloudndma-cloud/config/settings.py`: Root settings class that composes all sub-configurations.

#### infrastructure

#### workers

```
backend
├── ...
└── ndma-cloud/
    └── infrastructure/
        └── workers/
            └── celery/
                ├── __init__.py
                ├── app.py
                ├── config.py
                └── event_loop.py
```

- `ndma-cloud/infrastructure/workers/`: Hosts worker frameworks for long‑running or background logic. Multiple frameworks can live here; only Celery is configured at the moment.
- `ndma-cloud/infrastructure/workers/celery/app.py`: Celery application instance.
- `ndma-cloud/infrastructure/workers/celery/config.py`: Celery configuration class.
- `ndma-cloud/infrastructure/workers/celery/event_loop.py`: Shared event loop for running async code in sync Celery tasks.

### Docker

```
backend
├── .dockerignore
├── Dockerfile
├── compose.local.yml
└── ...
```

- `.dockerignore`: Excludes files from the Docker build context to keep images smaller and builds faster.
- `Dockerfile`: Defines how the ndma-cloud backend container image is built.
- `compose.local.yml`: Docker Compose configuration for running the ndma-cloud backend stack locally.