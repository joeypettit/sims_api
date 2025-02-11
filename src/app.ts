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

const app = express();
const port = 3000;


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

app.use((req, res, next)=>{
  console.log(req.session);
  console.log(req.user);
  next();
})

app.use(express.json());
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
