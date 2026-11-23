import { Client, Events, GatewayIntentBits } from "discord.js";
import { CONFIG } from "./config.js";
import { handleInteractionCreate } from "./events/interactionCreate.js";
import { handleMessageCreate } from "./events/messageCreate.js";
import { handleReady } from "./events/ready.js";
async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });
    client.once(Events.ClientReady, handleReady);
    client.on(Events.MessageCreate, handleMessageCreate);
    client.on(Events.InteractionCreate, handleInteractionCreate);
    await client.login(CONFIG.DISCORD_TOKEN);
}
void main().catch((error) => {
    console.error("アプリケーション実行時エラー:", error);
    process.exitCode = 1;
});
