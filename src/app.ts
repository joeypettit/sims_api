import express, { Request, Response } from "express";
import projectsRoutes from "./routes/projects";
import lineItemsRoutes from "./routes/line-items";
import groupRoutes from "./routes/groups";
import templatesRoutes from "./routes/templates";
import unitsRoutes from "./routes/units";
import optionsRoutes from "./routes/options";
import areasRoutes from "./routes/project-areas";
import authRoutes from "./routes/auth";
import clientsRoutes from "./routes/clients";
import session from 'express-session';
import passport from "passport";
import prisma from "../prisma/prisma-client";
import { PrismaSessionStore } from "../prisma/prisma-session-store";
import '../auth/passport';
import path from 'path';

const app = express();
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 3000;

const isDevelopment = process.env.NODE_ENV !== 'production';
const databaseUrl = isDevelopment 
  ? process.env.DATABASE_URL_DEV 
  : process.env.DATABASE_URL;

// Make sure this environment variable is available to Prisma
process.env.DATABASE_URL = databaseUrl;

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma),
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, 
    httpOnly: true,
  }
}))

app.use(passport.initialize());
app.use(passport.session());


// Middleware
app.use(express.json()); // If using JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/line-items", lineItemsRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/units", unitsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/project-areas", areasRoutes);
app.use("/api/clients", clientsRoutes);

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, "../client/dist")));

// Serve React frontend for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
