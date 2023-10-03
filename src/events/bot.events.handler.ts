// imports
import type { ArgsOf, Client } from "discordx";
import { Discord, On, Once } from "discordx";
import BringTheTallyBot from "../structs/BringTheTallyBot.js";
import { BaseInteraction, EmbedBuilder } from "discord.js";
import { avatar } from "../bot.js";

@Discord()
export class BotBasicEventsHandler {
  /**
   * @name ready
   * @description Event to initialize bot commands on ready...
   */
  @Once()
  async ready([]: ArgsOf<"ready">, bot: BringTheTallyBot): Promise<void> {
    // init commands
    await bot.initApplicationCommands();
    bot.LOG.info("Bot Logged In Successfully!");

    // status
    setTimeout(async () => {
      const status = await bot.user?.setPresence({
        status: "idle",
        activities: [{ name: "Game with Bring The Tally!", type: 5 }],
      });
      bot.LOG.info(status, "Bot Presence Changed!");
    }, 500);
  }

  /**
   * @name interactionCreate
   * @description Event to execute bot interactions on ready...
   */
  @On()
  async interactionCreate(
    [interaction]: ArgsOf<"interactionCreate">,
    bot: BringTheTallyBot
  ): Promise<void> {
    // Log and init interaction
    bot.LOG.debug(
      `Interaction Executed: ${interaction.id} Executed | GUILD ID: ${interaction.guildId} | TYPE: ${interaction.type}`
    );
    interaction = interaction satisfies BaseInteraction;
    // Error Handler
    try {
      bot.executeInteraction(interaction);
    } catch (e: any) {
      // error reply
      bot.LOG.fatal(e, "Error Occured During Executing Interaction!");
      if (!interaction.isRepliable) return;
      if (interaction.isCommand()) {
        interaction.reply({
          embeds: [errorMessageEmbed(e.message)],
        });
      } else if (interaction.isButton()) {
        // Handle errors for button interactions
        interaction.followUp({
          embeds: [errorMessageEmbed(e.message)],
        });
      } else if (interaction.isModalSubmit()) {
        // Handle errors for modal interactions
        interaction.reply({
          embeds: [errorMessageEmbed(e.message)],
        });
      } else if (interaction.isStringSelectMenu()) {
        // Handle errors for selectmenu of interactions
        interaction.reply({
          embeds: [errorMessageEmbed(e.message)],
        });
      }
    }
  }
}

const errorMessageEmbed = (msg: string) => {
  return new EmbedBuilder()
    .setColor("#ED4245")
    .setTitle("Error Occured!")
    .setDescription(`>>> ${msg}`)
    .setTimestamp()
    .setFooter({
      text: "Bring The Tally Bot Error Management",
      iconURL: avatar,
    });
};
