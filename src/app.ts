import express, { Request, Response } from "express";
import projectsRoutes from "./routes/projects";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/projects", projectsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
