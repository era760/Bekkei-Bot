import { registerCommands } from "../commands/index.js";
import { timerManager } from "../services/timerManager.js";
export async function handleReady(client) {
    console.log(`${client.user.tag} としてログインしました`);
    // スラッシュコマンドをDiscordサーバーに登録
    await registerCommands();
    // ボット再起動時のタイマー復元
    await timerManager.restoreTimer(client);
}
