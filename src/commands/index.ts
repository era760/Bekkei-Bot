import { Collection, REST, Routes } from "discord.js";
import { CONFIG } from "../config.js";
import type { Command } from "../types/index.js";
import { pingCommand } from "./ping.js";
import { timerCommand } from "./timer.js";

export const commands = new Collection<string, Command>();
commands.set(pingCommand.data.name, pingCommand);
commands.set(timerCommand.data.name, timerCommand);

export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(CONFIG.DISCORD_TOKEN);
  const commandBodies = commands.map((cmd) => cmd.data.toJSON());

  try {
    console.log(`スラッシュコマンドの登録を開始します (${commandBodies.length}件)...`);
    await rest.put(
      Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
      { body: commandBodies }
    );
    console.log("スラッシュコマンドの登録が正常に完了しました。");
  } catch (error) {
    console.error("スラッシュコマンドの登録に失敗しました:", error);
  }
}
