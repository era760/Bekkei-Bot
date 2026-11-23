import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/index.js";

export const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("ボットの応答速度（レイテンシ）を確認します"),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "🏓 計測中...",
      fetchReply: true,
    });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = interaction.client.ws.ping;
    await interaction.editReply(
      `🏓 **Pong!**\n- 往復レイテンシ: \`${roundtrip}ms\`\n- WebSocketレイテンシ: \`${wsPing}ms\``
    );
  },
};
