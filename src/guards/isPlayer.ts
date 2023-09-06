// imports
import {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  MentionableSelectMenuInteraction,
  Message,
  MessageReaction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  User,
  UserSelectMenuInteraction,
  VoiceState,
} from "discord.js";
import type { ArgsOf, GuardFunction } from "discordx";
import { SimpleCommandMessage } from "discordx";
import DB from "../db.js";

/**
 * Guard to make sure player exists
 *
 * @param arg
 * @param client
 * @param next
 */
export const isPlayer: GuardFunction<
  | ArgsOf<"messageCreate" | "messageReactionAdd" | "voiceStateUpdate">
  | ButtonInteraction
  | ChannelSelectMenuInteraction
  | CommandInteraction
  | ContextMenuCommandInteraction
  | MentionableSelectMenuInteraction
  | ModalSubmitInteraction
  | RoleSelectMenuInteraction
  | StringSelectMenuInteraction
  | UserSelectMenuInteraction
  | SimpleCommandMessage
> = async (arg, bot, next) => {
  // finding user
  const argObj = arg instanceof Array ? arg[0] : arg;
  const user =
    argObj instanceof CommandInteraction
      ? argObj.user
      : argObj instanceof MessageReaction
      ? argObj.message.author
      : argObj instanceof VoiceState
      ? argObj.member?.user
      : argObj instanceof Message
      ? argObj.author
      : argObj instanceof SimpleCommandMessage
      ? argObj.message.author
      : argObj instanceof ButtonInteraction ||
        argObj instanceof ChannelSelectMenuInteraction ||
        argObj instanceof CommandInteraction ||
        argObj instanceof ContextMenuCommandInteraction ||
        argObj instanceof MentionableSelectMenuInteraction ||
        argObj instanceof ModalSubmitInteraction ||
        argObj instanceof RoleSelectMenuInteraction ||
        argObj instanceof StringSelectMenuInteraction ||
        argObj instanceof UserSelectMenuInteraction
      ? argObj.member?.user
      : argObj.message?.author;

  if (user?.bot) return;

  // find player on db
  const player = await DB.player.findUnique({
    where: {
      discord: user?.id,
    },
  });

  // player already there
  if (player) return await next();

  // player missing , creating new player
  const newPlayer = await DB.player.create({
    data: {
      discord: user!.id,
    },
  });

  if (newPlayer) {
    try {
      let newBie = bot.users.resolve(user as User);
      await newBie.send({
        content: "Your new account created",
      });
    } catch {}
    return await next();
  } else throw new Error("Error In creating new user");
};
