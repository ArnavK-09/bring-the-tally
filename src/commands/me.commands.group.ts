// imports
import type { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";

@Discord()
@SlashGroup({ description: "Player Profile related commands...", name: "me" })
export class MeCommands {
  /**
   * @name view
   * @group me
   * @description Checkout player's profile...
   */
  @Slash({ description: "Checkout your profile..." })
  @SlashGroup("me")
  me(interaction: CommandInteraction) {
    interaction.reply("Your profile here");
  }

  /**
   * @name stats
   * @group me
   * @description View player's Overall game statistics...
   */
  @Slash({ description: "View your Overall game statistics..." })
  @SlashGroup("me")
  stats(interaction: CommandInteraction): void {
    interaction.reply(" player stats ");
  }
}
