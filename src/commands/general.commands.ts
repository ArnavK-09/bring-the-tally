// imports
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  type CommandInteraction,
} from "discord.js";
import { ButtonComponent, Discord, Slash } from "discordx";
import { bot } from "../main.js";

function heartbeatProcess(
  interaction: CommandInteraction | ButtonInteraction,
  ephemeral: boolean = false
) {
  const startTime = Date.now();
  interaction.deferReply({ ephemeral }).then(() => {
    interaction.editReply({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("heartbeat_ping")
            .setLabel(
              `Heartbeat: ${(startTime - Date.now())
                .toString()
                .replace("-", "")}ms`
            )
            .setEmoji("💖")
            .setStyle(ButtonStyle.Secondary)
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("heartbeat_ws")
            .setLabel(`Websocket: ${bot.ws.ping.toString().replace("-", "")}ms`)
            .setEmoji("⚡")
            .setStyle(ButtonStyle.Secondary)
        ),
      ],
    });
  });
}

@Discord()
export class GeneralCommands {
  /**
   * @name heartbeat
   * @description Returns ping of bot's heartbeat...
   */
  @Slash({
    name: "heartbeat",
    description: "Checkout heartbeat of bot...",
  })
  async heartbeat(interaction: CommandInteraction): Promise<void> {
    heartbeatProcess(interaction);
  }

  /**
   * @name heartbeat
   * @description Returns ping of bot's heartbeat...
   */
  @Slash({
    name: "faqs",
    description: "Checkout frequtnly asked questions about bot...",
  })
  async faqs(interaction: CommandInteraction): Promise<void> {
    heartbeatProcess(interaction);
  }

  /**
   * @name heartbeat
   * @description Button to check bot's heartbeat
   * @param {ButtonInteraction} ButtonInteraction
   */
  @ButtonComponent({ id: /heartbeat_[A-Za-z]+/i })
  heartbeat_btn(interaction: ButtonInteraction): void {
    heartbeatProcess(interaction, true);
  }
}
