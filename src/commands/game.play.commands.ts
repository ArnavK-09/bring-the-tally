// imports
import {
  EmbedBuilder,
  type CommandInteraction,
  type APIEmbed,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageActionRowComponentBuilder,
  SelectMenuComponentOptionData,
} from "discord.js";
import { Discord, Slash } from "discordx";
import { avatar } from "../bot.js";
import { getPlayerSession } from "../db.js";

// bot_dice_actions
export const bot_dice_actions: SelectMenuComponentOptionData[] = [
  {
    emoji: "➕",
    label: "Addition (+)",
    value: "add",
    description: "Adds Your Rolled Dice Number...",
  },
  {
    emoji: "➖",
    label: "Subtract (-)",
    value: "subtract",
    description: "Subtracts Your Rolled Dice Number...",
  },
  {
    emoji: "✖",
    label: "Multiply (*)",
    value: "multiply",
    description: "Multiplies Your Rolled Dice Number...",
  },
  {
    emoji: "➗",
    label: "Divide (/)",
    value: "divide",
    description: "Divides Your Rolled Dice Number...",
  },
];

/**
 * @name gamePlayEmbedParams
 * @argument gamePlayEmbed()
 */
export type gamePlayEmbedParams = {
  game: any;
  av: string;
  dice?: number;
  current?: number;
  target?: number;
};
/**
 * @name gamePlayEmbed
 * @Returns Returns gameplay embed
 * @param {gamePlayEmbedParams} gamePlayEmbedParams
 * @returns {APIEmbed}
 */
export function gamePlayEmbed({
  game,
  av,
  dice,
  target,
  current,
}: gamePlayEmbedParams): APIEmbed {
  return new EmbedBuilder()
    .setAuthor({
      name: "Bring The Tally Bot Game Play",
      iconURL: av,
    })
    .setTitle(
      `You're On: **${current}** | Dice: **${dice}** | Target Is: **${target}**`
    )
    .setDescription("> Playing game Guide here")
    .setColor("#5865F2")
    .setFooter({
      text: `Game Code: ${game.id}`,
    })
    .setTimestamp()
    .setImage(`attachment://${dice}.png`)
    .toJSON();
}

/**
 * @name gamePlayEmbedButtons
 * @description Returns gameplay embed buttons
 * @param {string} id
 * @returns {ButtonBuilder[]}
 */
export function gamePlayEmbedButtons(id: string) {
  const roll_dice_btn = new ButtonBuilder()
    .setCustomId(`roll_dice@${id}`)
    .setLabel("Roll Dice!")
    .setEmoji("🎲")
    .setStyle(ButtonStyle.Danger);

  const view_history_button = new ButtonBuilder()
    .setCustomId("view_roll_history")
    .setLabel("View Roll History")
    .setEmoji("⏳")
    .setStyle(ButtonStyle.Secondary);

  const faq_button = new ButtonBuilder()
    .setCustomId("roll_faq")
    .setLabel("FAQs")
    .setEmoji("⁉")
    .setStyle(ButtonStyle.Secondary);

  return [faq_button, roll_dice_btn, view_history_button];
}

@Discord()
export class GamePlayCommands {
  /**
   * @name game
   * @description Play your current game session...
   */
  @Slash({
    name: "game",
    description: "Play your current game session...",
  })
  async game(interaction: CommandInteraction): Promise<unknown> {
    const gameSession = await getPlayerSession(interaction.user.id, false);

    if (!gameSession) {
      return await interaction.reply({
        content: "No session there, start using /start",
      });
    }

    // session there
    let dice_actions: SelectMenuComponentOptionData[] = JSON.parse(
      JSON.stringify(bot_dice_actions)
    );
    dice_actions.forEach((option) => {
      if (option.value.toLowerCase() == gameSession.lastAction.toLowerCase()) {
        option.default = true;
      }
    });

    const menu = new StringSelectMenuBuilder()
      .addOptions(dice_actions)
      .setCustomId(`dice_actions@${gameSession.id}`);

    // create a row for message actions
    const actionChooserRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        menu
      );
    const gameButtonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      gamePlayEmbedButtons(gameSession.id)
    );
    const gameConfirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_dice@${gameSession.id}`)
        .setLabel("Roll Your Dice With Confirmed Action!")
        .setStyle(ButtonStyle.Success)
    );

    // reply
    await interaction.reply({
      embeds: [
        gamePlayEmbed({
          game: gameSession,
          av: interaction.user.displayAvatarURL() ?? avatar,
          dice: gameSession.dice,
          target: gameSession.target,
          current: gameSession.current,
        }),
      ],
      components: [gameButtonsRow, actionChooserRow, gameConfirmRow],
      files: [`./assets/${gameSession.dice}.png`],
    });
  }
}
