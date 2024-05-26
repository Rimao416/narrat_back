import mongoose from "mongoose";
// const express=require("express")
import app from "./index";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
process.on("uncaughtException", () => {
  console.log("UNCAUGHT EXCEPTION");
  process.exit(1);
});
let database: string;

if (process.env.NODE_ENV === "production") {
  database = process.env.DATABASE ?? "";
} else {
  database = process.env.DATABASE_TEST ?? "";
}
const databasePassword: string = process.env.DATABASE_PASSWORD ?? "";
// const DB_LOCAL = process.env.DATABASE_LOCAL;
const DB = database.replace("<password>", databasePassword);
mongoose.set("strictQuery", true);
mongoose.connect(DB).then(() => {
  console.log("Connexion réussie");
});
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Connexion réussie");
//   });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

interface unhandledRejection {
  name: string;
  message: string;
  stack?: string;
  code?: number;
}
console.log(process.env.NODE_ENV);
process.on("unhandledRejection", (err: unhandledRejection) => {
  console.log(err.name, err.message);
  // process.exit(1)
  server.close(() => {
    process.exit(1);
  });
});
