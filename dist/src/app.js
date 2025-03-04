"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projects_1 = __importDefault(require("./routes/projects"));
const line_items_1 = __importDefault(require("./routes/line-items"));
const groups_1 = __importDefault(require("./routes/groups"));
const templates_1 = __importDefault(require("./routes/templates"));
const units_1 = __importDefault(require("./routes/units"));
const options_1 = __importDefault(require("./routes/options"));
const project_areas_1 = __importDefault(require("./routes/project-areas"));
const auth_1 = __importDefault(require("./routes/auth"));
const clients_1 = __importDefault(require("./routes/clients"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const prisma_client_1 = __importDefault(require("../prisma/prisma-client"));
const prisma_session_store_1 = require("../prisma/prisma-session-store");
require("../auth/passport");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';
const databaseUrl = isDevelopment
    ? process.env.DATABASE_URL_DEV
    : process.env.DATABASE_URL;
// Make sure this environment variable is available to Prisma
process.env.DATABASE_URL = databaseUrl;
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new prisma_session_store_1.PrismaSessionStore(prisma_client_1.default),
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});
// Middleware
app.use(express_1.default.json()); // If using JSON payloads
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/line-items", line_items_1.default);
app.use("/api/groups", groups_1.default);
app.use("/api/templates", templates_1.default);
app.use("/api/units", units_1.default);
app.use("/api/options", options_1.default);
app.use("/api/project-areas", project_areas_1.default);
app.use("/api/clients", clients_1.default);
// Serve static files from React build folder
app.use(express_1.default.static(path_1.default.join(__dirname, "../client/dist")));
// Serve React frontend for all non-API routes
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../client/dist/index.html"));
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
