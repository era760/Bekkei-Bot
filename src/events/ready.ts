import type { Client } from "discord.js";
import { registerCommands } from "../commands/index.js";
import { timerManager } from "../services/timerManager.js";

export async function handleReady(client: Client<true>): Promise<void> {
  console.log(`${client.user.tag} としてログインしました`);

  // スラッシュコマンドをDiscordサーバーに登録
  await registerCommands();

  // ボット再起動時のタイマー復元
  await timerManager.restoreTimer(client);
}
