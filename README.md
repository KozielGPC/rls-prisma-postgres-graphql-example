# RLS With Prisma and PostgreSQL

## About

This project is destinated to study the RLS (Row Level Security) with Prisma and PostgreSQL, using `Prisma Extensions`.

## Tables and policies

### Users Table

| column | type   |
| ------ | ------ |
| id     | uuid   |
| name   | string |

### Organizations Table

| column      | type   |
| ----------- | ------ |
| id          | uuid   |
| name        | string |
| short_name  | string |
| description | string |

### OrganizationManagers Table

| column            | type |
| ----------------- | ---- |
| reference_user_id | uuid |
| organization_id   | uuid |

### Events Table

| column          | type    |
| --------------- | ------- |
| id              | uuid    |
| name            | string  |
| slug            | string  |
| description     | string  |
| published       | boolean |
| organization_id | uuid    |

### Policies

- User only is allowed to update, read or delete an Organization if he is OrganizationManager from that Organization
- User only is allowed to create, update, read or delete an Event if he is OrganizationManager from the Organization that is organizer from that Event

## How to Use

### Prerequisites

- Install [Node.js](https://nodejs.org/en/download/)
- Install [Docker](https://docs.docker.com/get-docker/)

### 1. Download example & install dependencies

Clone this repository:

```sh
git clone https://github.com/KozielGPC/rls-prisma-postgres-example.git
```

Create a `.env` file and install dependencies:

```sh
cd rls-prisma-postgres-example
cp .env.example .env
yarn install
```

### 2. Start the database

Run the following command to start a new Postgres database in a Docker container:

```sh
docker compose up -d
```

### 3. Run migrations

Run this command to apply migrations to the database:

```sh
yarn prisma migrate deploy
```

### 4. Seed the database

Run the following command to add seed data to the database:

```sh
yarn prisma db seed
```

### 5. Run the `test` script

To run the `tests.spec.ts` file, run the following command:

```sh
yarn jest
```
