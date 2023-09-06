// imports
import { PrismaClient } from "@prisma/client";
import { Snowflake } from "discord.js";

// new client
const DB = new PrismaClient();

// logging
DB.$use(async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  console.log(
    `Query ${params.model}.${params.action} took ${after - before}ms`
  );

  return result;
});

// exporting
export default DB;

/* Useful functions */

/**
 * @name isThereAnyPlayerSession
 * @description Finds if there any game running of player on db
 * @param {Snowflake} id Player's ID
 */
export const isThereAnyPlayerSession = async (id: Snowflake) => {
  const game = await DB.game.findFirst({
    where: {
      playerId: id,
      end: false,
    },
  });
  if (game) return true;
  else return false;
};

/**
 * @name getPlayerSession
 * @description Returns player session information from db
 * @param {Snowflake} id Player's ID
 */
export const getPlayerSession = async (
  id: Snowflake,
  ended: boolean = true
) => {
  const gameSession = await DB.game.findFirst({
    where: {
      playerId: id,
      end: ended,
    },
  });
  return gameSession;
};

/**
 * @name createNewGameSession
 * @description Creates new game session for player
 * @param {Snowflake} id Player's ID
 */
export const createNewGameSession = async (id: Snowflake) => {
  const game = await DB.game.create({
    data: {
      playerId: id,
      target: Math.floor(Math.random() * 50) + 1,
    },
  });
  return game;
};

/**
 * @name deleteGameSession
 * @description Deletes game session for player
 * @param {Snowflake} id Game session id
 */
export const deleteGameSession = async (id: Snowflake) => {
  try {
    const gameSession = await getPlayerSession(id, false);
    await DB.game.delete({
      where: {
        playerId_id: {
          playerId: id,
          id: gameSession!.id,
        },
      },
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * @name getPlayerMovesHistory
 * @description Returns Player Gameplay History
 * @param {Snowflake} id Player's ID
 */
export const getPlayerMovesHistory = async (id: Snowflake) => {
  const game = await DB.game.findFirst({
    where: {
      playerId: id,
    },
  });
  return game?.history;
};
