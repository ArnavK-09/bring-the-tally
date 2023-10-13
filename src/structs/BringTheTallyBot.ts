// imports
import { Client } from "discordx";
import logger from "pino";

/**
 * BringTheTallyBot
 */
export default class BringTheTallyBot extends Client {
  /**
   * Bot logger system
   */
  public LOG = logger();

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

/**
 * Bot Type
 */
// export declare class Bot extends Client {
//   public LOG: Logger
//   public deleteAllApplicationCommandsFromAllServers(): Promise<void>;
// }
