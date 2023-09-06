// imports
import type { ArgsOf, Client } from "discordx";
import { Discord, On, Once } from "discordx";

@Discord()
export class BotBasicEventsHandler {
  /**
   * @name ready
   * @description Event to initialize bot commands on ready...
   */
  @Once()
  async ready([]: ArgsOf<"ready">, bot: Client): Promise<void> {
    await bot.initApplicationCommands();
    console.log("Connected");
    await bot.user?.setPresence({
      status: "idle",
      activities: [{ name: "Game with Bring The Tally!", type: 5 }],
    });
  }

  /**
   * @name interactionCreate
   * @description Event to execute bot interactions on ready...
   */
  @On()
  async interactionCreate(
    [interaction]: ArgsOf<"interactionCreate">,
    bot: Client
  ): Promise<void> {
    console.log(`Slash cmd: ${interaction.id}`);
    bot.executeInteraction(interaction);
  }
}
