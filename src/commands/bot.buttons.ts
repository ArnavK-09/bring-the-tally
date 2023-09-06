// imports
import {
  EmbedBuilder,
  type ButtonInteraction,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
  ButtonBuilder,
  MessageActionRowComponentBuilder,
  ActionRowBuilder,
  StringSelectMenuInteraction,
  ButtonStyle,
} from "discord.js";
import { ButtonComponent, Discord, SelectMenuComponent } from "discordx";
import DB, { getPlayerMovesHistory } from "../db.js";
import { avatar as botAvatar } from "../bot.js";
import { DiceAction, Game } from "@prisma/client";
import {
  bot_dice_actions,
  gamePlayEmbed,
  gamePlayEmbedButtons,
} from "./game.play.commands.js";

/**
 * @name diceRolled
 * @description Returns random num  from 1-6
 * @returns {number} number
 */
export const diceRolled = (): number => {
  return Math.floor(Math.random() * 6) + 1 > 6
    ? diceRolled()
    : Math.floor(Math.random() * 6) + 1;
};

/**
 * @name resolveAction
 */
export const resolveAction = (i: DiceAction | string) => {
  switch (i.trim().toLowerCase()) {
    case "add":
      return "+";
    case "subtract":
      return "-";
    case "multiply":
      return "*";
    case "divide":
      return "/";
    default:
      return "+";
  }
};

/**
 * @name userWon
 * @description user won embed
 * @param {ButtonInteraction} i
 * @param {number} res
 * @param {number} rolled
 */
const userWon = async (i: ButtonInteraction, res: number, rolled: number) => {
  await i.message.edit({
    content: "You won :tada:",
  });
  await i.deferReply();
  // finding game
  await DB.game
    .update({
      where: {
        playerId: i.user.id,
        id: i.customId.toString().split("@")[1],
      },
      data: {
        ended: new Date(),
        current: Math.abs(res),
        dice: rolled,
        end: true,
      },
    })
    .then(async () => {
      await i
        .editReply({
          content: "You won :tada:",
        })
        .then((m) => {
          setTimeout(() => {
            m.delete();
          }, 1000 * 5);
        });
    });
};

@Discord()
export class BasicBotButtons {
  /**
   * @name roll_faq
   * @description Button for FAQs
   * @param {ButtonInteraction} ButtonInteraction
   */
  @ButtonComponent({ id: "roll_faq" })
  roll_faq(interaction: ButtonInteraction): void {
    interaction.reply(":wave:");
  }

  /**
   * @name roll_dice
   * @description Roll dice main func for gameplay
   * @todo fix
   * @param {ButtonInteraction} ButtonInteraction
   */
  @ButtonComponent({ id: /roll_dice@(.*?)+/i })
  async roll_dice(interaction: ButtonInteraction): Promise<any> {
    // finding game
    let game: Game = (await DB.game.findUnique({
      where: {
        playerId: interaction.user.id,
        id: interaction.customId.toString().split("@")[1],
      },
    })) as Game;
    if (!game) {
      return await interaction.reply({
        content: "Err, no game session found",
      });
    }

    // rolling
    const rolled = diceRolled();

    await DB.game
      .update({
        where: {
          playerId: interaction.user.id,
          id: interaction.customId.toString().split("@")[1],
        },
        data: {
          dice: rolled,
        },
      })
      .then(async () => {
        // update game
        let dice_actions: [] = JSON.parse(JSON.stringify(bot_dice_actions));
        dice_actions.forEach((option: SelectMenuComponentOptionData) => {
          if (option.value.toLowerCase() == game.lastAction.toLowerCase()) {
            option.default = true;
          }
        });

        const menu = new StringSelectMenuBuilder()
          .addOptions(dice_actions)
          .setCustomId(`dice_actions@${game.id}`);

        // create a row for message actions
        const actionChooserRow =
          new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            menu
          );
        const gameButtonsRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            gamePlayEmbedButtons(game.id)
          );
        const gameConfirmRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`confirm_dice@${game.id}`)
              .setLabel("Roll Your Dice With Confirmed Action!")
              .setStyle(ButtonStyle.Success)
          );

        game = (await DB.game.findUnique({
          where: {
            playerId: interaction.user.id,
            id: interaction.customId.toString().split("@")[1],
          },
        })) as Game;
        await interaction.message.edit({
          embeds: [
            gamePlayEmbed({
              game: game,
              av: interaction.user.displayAvatarURL() ?? botAvatar,
              dice: game.dice,
              target: game.target,
              current: game.current,
            }),
          ],
          components: [gameButtonsRow, actionChooserRow, gameConfirmRow],
          files: [`./assets/${game.dice}.png`],
        });

        // notify
        await interaction
          .reply({
            content: `Dice rolled, you got ${rolled}`,
          })
          .then((m) => {
            setTimeout(() => {
              m.delete();
            }, 1000 * 5);
          });
      });
  }

  /**
   * @name confirm_dice
   * @description Confirms dice action
   * @param {ButtonInteraction} ButtonInteraction
   */
  @ButtonComponent({ id: /confirm_dice@(.*?)+/i })
  async confirm_dice(interaction: ButtonInteraction): Promise<any> {
    // finding game
    let game: Game = (await DB.game.findUnique({
      where: {
        playerId: interaction.user.id,
        id: interaction.customId.toString().split("@")[1],
      },
    })) as Game;
    if (!game) {
      return await interaction.reply({
        content: "Err, no game session found",
      });
    }

    // get user rolled
    const rolled = game.dice;
    let res = game.current;

    // update number
    switch (resolveAction(game.lastAction)) {
      case "+":
        res = Math.floor(res + rolled);
        break;
      case "-":
        res = Math.floor(res - rolled);
        break;
      case "*":
        res = Math.floor(res * rolled);
        break;
      case "/":
        res = Math.floor(res / rolled);
        break;
      default:
        break;
    }
    // if won
    if (res == game.target) {
      return await userWon(interaction, res, rolled);
    }

    await DB.game.update({
      where: {
        playerId: interaction.user.id,
        id: interaction.customId.toString().split("@")[1],
      },
      data: {
        current: Math.abs(res),
      },
    });

    // push to history
    game.history.push({
      operation: resolveAction(game.lastAction),
      num: rolled,
    });
    await DB.game.update({
      where: {
        playerId: interaction.user.id,
        id: interaction.customId.toString().split("@")[1],
      },
      data: {
        history: game.history,
      },
    });

    // update game
    let dice_actions: [] = JSON.parse(JSON.stringify(bot_dice_actions));
    dice_actions.forEach((option: SelectMenuComponentOptionData) => {
      if (option.value.toLowerCase() == game.lastAction.toLowerCase()) {
        option.default = true;
      }
    });

    const menu = new StringSelectMenuBuilder()
      .addOptions(dice_actions)
      .setCustomId(`dice_actions@${game.id}`);

    // create a row for message actions
    const actionChooserRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        menu
      );
    const gameButtonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      gamePlayEmbedButtons(game.id)
    );
    const gameConfirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_dice@${game.id}`)
        .setLabel("Roll Your Dice With Confirmed Action!")
        .setStyle(ButtonStyle.Success)
    );

    // game = (await DB.game.findUnique({
    //   where: {
    //     playerId: interaction.user.id,
    //     id: interaction.customId.toString().split("@")[1],
    //   },
    // })) as Game;
    await interaction.message.edit({
      embeds: [
        gamePlayEmbed({
          game: game,
          av: interaction.user.displayAvatarURL() ?? botAvatar,
          dice: game.dice,
          target: game.target,
          current: Math.abs(res),
        }),
      ],
      components: [gameButtonsRow, actionChooserRow, gameConfirmRow],
      files: [`./assets/${game.dice}.png`],
    });

    // notify
    await interaction
      .reply({
        content: `Updated game`,
      })
      .then((m) => {
        setTimeout(() => {
          m.delete();
        }, 1000 * 5);
      });
  }

  /**
   * @name roll_faq
   * @description Button to view User's current game roll history
   * @todo pagination
   * @param {ButtonInteraction} ButtonInteraction
   */
  @ButtonComponent({ id: "view_roll_history" })
  async view_roll_history(interaction: ButtonInteraction): Promise<void> {
    const history = await getPlayerMovesHistory(interaction.user.id);
    const historyEmbed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("Your Previous Moves...")
      .setAuthor({
        name: `Moves By @${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription("> GUIDE Here")
      .setThumbnail(botAvatar)
      .setFooter({
        text: "Enjoy Using Bring The Tally Bot",
        iconURL: botAvatar,
      });

    for (let h = 0; h < (history ?? []).length; h++) {
      historyEmbed.addFields({
        name: "Operation",
        value: `\` ${history![h].operation} \``,
        inline: true,
      });

      historyEmbed.addFields({
        name: "Tally",
        value: `\` ${history![h].num} \``,
        inline: true,
      });

      historyEmbed.addFields({ name: " ", value: " " });
    }

    await interaction.reply({
      embeds: [historyEmbed],
    });
  }

  /**
   * @name confirm_dice_Action
   * @description Notifies the user for action change...
   * @param {StringSelectMenuInteraction} StringSelectMenuInteraction
   */
  @SelectMenuComponent({ id: /dice_actions@(.*?)+/i })
  async confirm_dice_Action(
    interaction: StringSelectMenuInteraction
  ): Promise<void> {
    await DB.game.update({
      where: {
        playerId: interaction.user.id,
        id: interaction.customId.toString().split("@")[1],
      },
      data: {
        lastAction: interaction.values[0].toUpperCase() as DiceAction,
      },
    });
    await interaction.reply({
      content: `Action changed -> ${interaction.values[0]}`,
      ephemeral: true,
    });
  }
}
