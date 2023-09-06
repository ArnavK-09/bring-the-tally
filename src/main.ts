// imports
import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import BringTheTallyBot from "./structs/BringTheTallyBot.js";

// bot init
export const bot = new BringTheTallyBot({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers],
});

/**
 * @namespace run_Bot
 * @description Runs whole bot system
 */
async function run_Bot() {
  // Import files
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  // if (!process.env.BOT_TOKEN) {
  //   throw Error("Could not find BOT_TOKEN in your environment");
  // }

  // Log in with your bot token
  await bot.login(
    "MTE0Mzk1NzI4NjY3OTc2MDkwNg.G7RW5Y.wqoSYKHTvjUHSZTKjcCLo2uxDFLZMfBKVcdfOc"
  );
}

run_Bot();
