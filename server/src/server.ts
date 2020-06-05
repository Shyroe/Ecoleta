import express from "express";
import routes from "./routes";
import path from "path";

const app = express();

//Middlewares
app.use(express.json());

app.use(routes);

// static files
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.listen(3333);
