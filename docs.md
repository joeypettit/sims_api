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

## TODO: ERROR HANDLING ON API
Using middleware for centralized error handling is a powerful approach in frameworks like Express.js. It simplifies error management across your application, promotes clean code, and ensures consistent error responses.

Here’s an in-depth look at the middleware approach:

What is Error Handling Middleware?
In Express, middleware functions are functions that have access to the request (req), response (res), and the next middleware in the pipeline. Error-handling middleware specifically catches errors that are passed down the chain using next(error) or thrown in asynchronous functions.

Advantages of Middleware-Based Error Handling
Consistency: Ensures that all errors, regardless of their source, are handled in the same way.
Centralized Logic: Reduces redundancy by consolidating error-handling logic in one place.
Separation of Concerns: Keeps route and service logic focused on their primary responsibilities.
Flexibility: Allows you to customize error responses (e.g., add error codes, logging, or metadata).
How It Works
Middleware catches errors via next(error) or uncaught errors in async functions.
The error-handling middleware inspects the error, logs it, and sends a consistent response to the client.
Middleware can categorize errors (e.g., validation errors, not found errors, server errors) and respond accordingly.
Implementation Steps
1. Define Error-Handling Middleware
Create a centralized error-handling middleware function.

typescript
Copy code
import { NextFunction, Request, Response } from "express";

// Custom error type (optional)
class AppError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err.message);

  // Check if it's a custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Default to 500 for unexpected errors
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
}
2. Use Middleware in Your App
Register the middleware in your app. The error-handling middleware should be the last middleware added.

typescript
Copy code
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

// Routes
app.use("/users", userRouter);
app.use("/projects", projectRouter);

// Error-handling middleware (must come last)
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
How to Throw Errors
Errors can be thrown from anywhere in your code. For more controlled errors, use custom error classes like AppError.

Throwing in Services
typescript
Copy code
class UserService {
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404); // Custom error with status code
    }
    return user;
  }
}
Throwing in Routes
typescript
Copy code
router.get("/:id", async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error); // Pass the error to the middleware
  }
});
Enhanced Features
1. Error Categorization
You can categorize errors and provide custom responses based on the error type or status code.

typescript
Copy code
function errorHandler(err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Invalid input", details: err.details });
  }
  if (err.statusCode === 404) {
    return res.status(404).json({ error: "Resource not found" });
  }
  res.status(500).json({ error: "Internal Server Error" });
}
2. Error Logging
Log errors for debugging or monitoring purposes (e.g., using tools like Winston, Sentry, or console logs).

typescript
Copy code
import winston from "winston";

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

function errorHandler(err, req, res, next) {
  logger.error(err.message);
  res.status(500).json({ error: "Internal Server Error" });
}
3. Customize for Development and Production
Show detailed error messages in development but hide them in production.

typescript
Copy code
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === "production";
  res.status(err.statusCode || 500).json({
    error: err.message,
    ...(isProduction ? {} : { stack: err.stack }), // Include stack trace in non-production
  });
}
When to Use This Approach
API-first applications: Ensures consistent error responses across endpoints.
Large codebases: Centralizes error handling logic, making maintenance easier.
Debugging: Logs detailed errors to help developers track issues.
By following this middleware-based approach, you can manage errors effectively while keeping your routes and services clean and focused.
