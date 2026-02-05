import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./app/routes/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import { connect } from "./config/db.config.js";
import { attachUser } from "./app/middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connect();

// Configure Handlebars
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      eq: (a, b) => a === b,
      includes: (array, value) => array && array.includes(value),
      initials: (name) => {
        if (!name) return "?";
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
      },
      statusColor: (status) => {
        const colors = {
          AVAILABLE: "success",
          RENTED: "warning",
          MAINTENANCE: "info",
          PENDING: "info",
          CONFIRMED: "warning",
          ACTIVE: "success",
          COMPLETED: "secondary",
          CANCELLED: "danger",
        };
        return colors[status] || "secondary";
      },
      roleColor: (role) => {
        const colors = {
          ADMIN: "danger",
          STAFF: "info",
          CUSTOMER: "success",
        };
        return colors[role] || "secondary";
      },
      formatDate: (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  }),
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'car-rental-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Attach user to templates
app.use(attachUser);

const port = 3000;

// Mount auth routes first (no authentication required)
app.use('/auth', authRoutes);

// Mount all other routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}/`);
});
