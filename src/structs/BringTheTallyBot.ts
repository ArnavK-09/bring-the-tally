// imports
import { Client } from "discordx";

// BringTheTallyBot
export default class BringTheTallyBot extends Client {
  /**
   * @name deleteAllApplicationCommandsFromAllServers
   * @description Clears all commands from all servers
   * @logic Fetch Guilds -> Clear all commands
   * @public
   */
  public async deleteAllApplicationCommandsFromAllServers() {
    await this.guilds.fetch();
    await this.clearApplicationCommands(...this.guilds.cache.map((g) => g.id));
  }
}
