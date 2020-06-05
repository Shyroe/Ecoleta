import { Request, Response } from "express"; // informando qual é o tipo do req and res
import knex from "../database/connection";

class PointsController {
  // Sem utilizar trx (Funcionando)
  // async create(req: Request, res: Response) {
  //   const {
  //     name,
  //     email,
  //     whatsapp,
  //     latitude,
  //     longitude,
  //     city,
  //     uf,
  //     items,
  //   } = req.body;

  //   //Create transaction
  //   // Transaction serve para impedir que uma query execute se a outra falhar, ou seja, se uma der erro a outra não executa
  //   // const trx = await knex.transaction();

  //   const point = {
  //     image: "image-fake",
  //     name,
  //     email,
  //     whatsapp,
  //     latitude,
  //     longitude,
  //     city,
  //     uf,
  //   };

  //   // O método insert retorna os insertedIds dos registros que foram inseridos.
  //   // Como nesse caso, há apenas um registro (ponto de coleta), então ele retornará o id do ponto de coleta
  //   try {
  //     const insertedIds = await knex("points").insert(point);

  //     // Criar o id do obj point que foi inserido
  //     const point_id = insertedIds[0];

  //     // Criar o point_items
  //     const pointItems = items.map((item_id: number) => {
  //       return {
  //         item_id: item_id,
  //         point_id: point_id,
  //       };
  //     });

  //     // point_items tabela criada pelo relacionamento das tabelas: points e items
  //     await knex("point_items").insert(pointItems);
  //     return res.json({
  //       id: point_id,
  //       ...point,
  //     });
  //   } catch (err) {
  //     console.log("insert point: ", err);
  //   }
  // }

  // create utilizando transaction - Funcionando
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;

    //Create transaction
    // Transaction serve para impedir que uma query execute se a outra falhar, ou seja, se uma der erro a outra não executa
    // const trx = await knex.transaction();

    const point = {
      image: "image-fake",
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    // O método insert retorna os insertedIds dos registros que foram inseridos.
    // Como nesse caso, há apenas um registro (ponto de coleta), então ele retornará o id do ponto de coleta
    knex.transaction(async (trx) => {
      try {
        const insertedIds = await trx("points").insert(point);

        // Criar o id do obj point que foi inserido
        const point_id = insertedIds[0];

        // Criar o point_items
        const pointItems = items.map((item_id: number) => {
          return {
            item_id: item_id,
            point_id: point_id,
          };
        });

        // point_items tabela criada pelo relacionamento das tabelas: points e items
        await trx("point_items").insert(pointItems);
        return res.json({
          id: point_id,
          ...point,
        });
      } catch (err) {
        console.log("insert point: ", err);
      }
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      res.status(400).json({
        message: "point not found",
      });
    }

    res.json(point);
  }
}

export default PointsController;
