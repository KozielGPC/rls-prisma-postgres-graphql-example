# RLS With Prisma, PostgreSQL and GraphQL

## About

This project is destinated to study the RLS (Row Level Security) with 3 implementations:
- Prisma and PostgreSQL, using `Prisma Extensions`.
- GraphQL directives.
- Nest.JS Guards

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

- User is only allowed to update, read or delete an Organization if he is OrganizationManager from that Organization
- User is only allowed to create, update, read or delete an Event if he is OrganizationManager from the Organization that is organizer from that Event

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
docker-compose up -d
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

### 5. Run application

To run the application you should run the following command:

```sh
yarn start:dev
```

Then you can access it at `http://localhost:3000/graphql`

### 6. Run the `test` script

To run the `tests.spec.ts` file, run the following command:

```sh
yarn jest
```

## Examples
### Nest Guard
Nest Guard requiring `ADMIN` role but `roles` header only contains `USER`:
![image](https://github.com/KozielGPC/rls-prisma-postgres-example/assets/37910437/58bae0ab-1087-484e-8d2e-a544ced5747e)

### GraphQL Directives
Directive to deny access to the field `description`:

Without requesting `description` field:
![image](https://github.com/KozielGPC/rls-prisma-postgres-example/assets/37910437/1e65092b-85ef-44cb-a978-bc6c66485726)

Requesting `description field`:
![image](https://github.com/KozielGPC/rls-prisma-postgres-example/assets/37910437/82ee248d-8643-4b29-8b74-a55a0581b9b2)

### PostgreSQL RLS
To-Do

## Notes
Using the `Prisma Extensions` implementation, there is a bug where you run a query with the RLS and then run a second with ByPass, it throws an error. It is better descripted in this [issue](https://github.com/prisma/prisma/issues/20407), and the solution is to connect with two different prisma clients, but it connects using 26 connections from the connection pool (13 for each client). If you wanna see the conenction info, uncomment the lines of logs in the PrismaClient instances at `main.ts`
