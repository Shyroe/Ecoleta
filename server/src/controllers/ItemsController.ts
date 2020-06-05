import { Request, Response } from "express";
import knex from "../database/connection";

class ItemsController {
  async index(req: Request, res: Response) {
    try {
      const items = await knex("items").select("*");

      // Serialização. Processo de modificar os dados do banco do jeito que for melhor para realizar determinada atividade.
      // nesse caso, estou modificando a prop image(apenas nome da imagem) para prop image_url (url completa da imagem)
      const serializedItems = items.map((item) => {
        return {
          id: item.id,
          title: item.title,
          image_url: `http://localhost:3333/uploads/${item.image}`,
        };
      });
      return res.json(serializedItems);
    } catch (err) {
      console.log(err);
    }
  }
}

export default ItemsController;
