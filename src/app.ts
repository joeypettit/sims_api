import express, { Request, Response } from "express";
import projectsRoutes from "./routes/projects";
import lineItemsRoutes from "./routes/line-items";
import groupRoutes from "./routes/groups";
import templatesRoutes from "./routes/templates";
import unitsRoutes from "./routes/units";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/projects", projectsRoutes);
app.use("/api/line-items", lineItemsRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/units", unitsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
