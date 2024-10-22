# To seed DB:

`npx prisma db seed`

# Evolving your application

Whenever you make changes to your database that are reflected in the Prisma schema, you need to manually re-generate Prisma Client to update the generated code in the node_modules/.prisma/client directory:
`prisma generate`

# UPDATING PRISMA SCHEMA:

To update your database after modifying your Prisma schema file, you can use either prisma migrate dev or prisma db push, depending on your needs and the stage of your development process.
Using prisma migrate dev: This command is used to create and apply a migration. It is suitable when you want to keep a history of your schema changes and generate SQL migration files that you can review and edit before applying.

npx prisma migrate dev --name your_migration_name
This command will create a new migration file and apply it to your database. It also regenerates the Prisma Client to reflect the new schema changes.
Learn more about using prisma migrate dev
Using prisma db push: This command directly applies the changes from your Prisma schema to your database without creating a migration file. It is useful for prototyping or when you don't need to maintain a migration history.

npx prisma db push
This command updates your database schema to match your Prisma schema and regenerates the Prisma Client.
Learn more about prisma db push
Choose the method that best fits your workflow. If you are in the early stages of development or prototyping, prisma db push might be more convenient. For production environments or when you need to track changes, prisma migrate dev is recommended.

# IN DEV ONLY

`npx prisma db push --force-reset` to reset to current schema without migration, dropping all data.
`npx prisma db seed` to reseed the db after resetting
