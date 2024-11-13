import express, { Request, Response } from "express";
import projectsRoutes from "./routes/projects";
import lineItemsRoutes from "./routes/line-items";
import groupRoutes from "./routes/groups";
import templatesRoutes from "./routes/templates";
import unitsRoutes from "./routes/units";
import optionsRoutes from "./routes/options";
import areasRoutes from "./routes/project-areas";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/projects", projectsRoutes);
app.use("/api/line-items", lineItemsRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/units", unitsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/project-areas", areasRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
