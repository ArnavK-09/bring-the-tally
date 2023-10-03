// imports
import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import BringTheTallyBot from "./structs/BringTheTallyBot.js";

// bot init
export const bot = new BringTheTallyBot({
  // Discord intents
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers],
});

/**
 * @namespace main
 * @description Runs whole bot system
 */
async function main() {
  // Import files
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN as string);
}

// Error handler
process.on("unhandledRejection", (error) => {
  console.log(error);
  // bot.LOG.error(error, "Process Error Occured!")
});

main();
