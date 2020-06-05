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
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
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

  // create utilizando transaction v2 - não testado
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
  //   const trx = await knex.transaction();

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
  //
  //     try {
  //       const insertedIds = await trx("points").insert(point);

  //       // Criar o id do obj point que foi inserido
  //       const point_id = insertedIds[0];

  //       // Criar o point_items
  //       const pointItems = items.map((item_id: number) => {
  //         return {
  //           item_id: item_id,
  //           point_id: point_id,
  //         };
  //       });

  //       // point_items tabela criada pelo relacionamento das tabelas: points e items
  //       await trx("point_items").insert(pointItems);
  //       return res.json({
  //         id: point_id,
  //         ...point,
  //       });
  // No final de todas as transactions é necessário usar: trx.commit() para que as transactions sejam comitadas para o banco de dados
  // await trx.commit()
  //     } catch (err) {
  //       console.log("insert point: ", err);
  //     }
  //   });
  // }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      res.status(400).json({
        message: "point not found",
      });
    }

    // Criar relacionamento entre tabelas: items e point_items
    // Sintaxe em SQL:
    /*
      SELECT * FROM items
          JOIN point_items ON items.id = point_items.item_id
          WHERE point_items.point_id = id
    */
    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");
    res.json({ point, items });
  }

  async index(req: Request, res: Response) {
    // O req.query serve para lidarmos com filtros, paginação, ou seja, para casos onde precisamos pegar informações da url
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");
    // A query acima, procura por todos os points que possuem o id igual a point_items.point_id
    // e que possue ao menos um único id que seja igual a um dos ids (números) que estão no array parsedItems(filtro por items)
    // Filtro por city - retorna todos os pontos de coleta que estão atuando na city informada
    // Filtro por uf - retorna todos os pontos de coleta que estão atuando na uf informada
    // vai retorna apenas pontos distintos, ou seja, não vai repetir o ponto caso ele colete mais de um item que foi informado no array
    // O select serve para selecionar todos os items apenas da tabela points
    return res.json(points);
  }
}

export default PointsController;
