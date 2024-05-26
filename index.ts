import express, { Application } from "express";
import AppError from "./utils/appError";

// const globalErrorHandler = require("./controllers/errorController");
import globalErrorHandler from "./controllers/errorController";
// const userRouter = require("./routes/userRoutes");
import authorRoutes from "./routes/authorRoutes";
// const categoryRouter=require("./routes/categoryRoutes")
import bookRoutes from "./routes/bookRoutes";
import categoryRoutes from "./routes/categoryRoutes";
// const authRoute = require("./routes/auth");
const app: Application = express();
import cors from "cors";
// 1) MIDDLEWARE

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173","http://localhost:5174"],
    credentials: true,
  })
);
// app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   req.requestTime = new Date();
//   next();
// });

// 2) ROUTE HANDLERS

// 3) ROUTES

// app.use((req, res, next) => {
//   console.log("Hello from middleware");
//   next();
// });

// app.use("/api/v1/users", userRouter);
app.use("/api/v1/authors", authorRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/books", bookRoutes);
// app.use("/auth", authRoute);

// Handle Errors

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// 4) SERVER

export default app;
