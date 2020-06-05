import express from "express";

//Import controllers
import PointsController from "./controllers/PointsController";
const pointsController = new PointsController();
import ItemsController from "./controllers/ItemsController";
const itemsController = new ItemsController();

const routes = express.Router();
// Padrão de convenção adotado pela comunidade node para criar métodos para operações de CRUD
// index, show,create, update, delete - list, exibir apenas 1 obj, criar, atualizar, deletar

routes.get("/items", itemsController.index);

// Create collect points
routes.post("/points", pointsController.create);
routes.get("/points/:id", pointsController.show);

export default routes;
