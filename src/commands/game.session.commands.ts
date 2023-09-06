// imports
import type { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { isPlayer } from "../guards/isPlayer.js";
import {
  createNewGameSession,
  deleteGameSession,
  isThereAnyPlayerSession,
} from "../db.js";

@Discord()
export class GameSessionCommands {
  /**
   * @name start
   * @description Start a new session for game...
   */
  @Slash({
    name: "start",
    description: "Start a new session for game...",
  })
  @Guard(isPlayer)
  async start(interaction: CommandInteraction): Promise<void> {
    const userSession = await isThereAnyPlayerSession(interaction.user.id);
    if (userSession) {
      // game running
      interaction.reply({
        content: "You already have a game running, play it using ``` /game ```",
      });
    } else {
      // no game
      await interaction.deferReply();
      await createNewGameSession(interaction.user.id).then((newSession) => {
        interaction.editReply({
          content: "New game created, code: " + newSession.id.toString(),
        });
      });
    }
  }

  /**
   * @name end
   * @description Ends current running session for game of user...
   */
  @Slash({
    name: "end",
    description: "Ends current running session for game of user...",
  })
  async end(interaction: CommandInteraction): Promise<void> {
    const userSession = await isThereAnyPlayerSession(interaction.user.id);
    if (!userSession) {
      // game running
      interaction.reply({
        content:
          "You havent started any game yet, start it using ``` /start ```",
      });
    } else {
      // no game
      await interaction.deferReply();
      await deleteGameSession(interaction.user.id).then((status) => {
        if (!status) {
          interaction.editReply({
            content: "Failed",
          });
        } else {
          interaction.editReply({
            content: "Successfully delted game session",
          });
        }
      });
    }
  }
}
