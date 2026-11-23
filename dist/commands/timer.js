import { SlashCommandBuilder } from "discord.js";
import { CONFIG } from "../config.js";
import { timerManager } from "../services/timerManager.js";
export const timerCommand = {
    data: new SlashCommandBuilder()
        .setName("timer")
        .setDescription("Bumpタイマーを手動管理します")
        .addSubcommand((sub) => sub
        .setName("start")
        .setDescription("タイマーを手動で開始します（デフォルト: 2時間）")
        .addIntegerOption((opt) => opt
        .setName("minutes")
        .setDescription("タイマーの分数（省略時は120分 = 2時間）")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(1440)))
        .addSubcommand((sub) => sub
        .setName("status")
        .setDescription("現在のタイマーの残り時間を確認します"))
        .addSubcommand((sub) => sub
        .setName("cancel")
        .setDescription("実行中のタイマーをキャンセルします")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.channel;
        if (!channel || !channel.isSendable()) {
            await interaction.reply({
                content: "このチャンネルではタイマーを実行できません。",
                ephemeral: true,
            });
            return;
        }
        if (subcommand === "start") {
            const minutes = interaction.options.getInteger("minutes") ?? 120;
            const durationMs = minutes * 60 * 1000;
            const timerData = await timerManager.startTimer(channel, durationMs, interaction.guildId ?? CONFIG.GUILD_ID);
            const targetUnix = Math.floor(timerData.targetTime / 1000);
            await interaction.reply({
                content: `⏰ **タイマーを開始しました！**\n- 設定時間: ${minutes}分\n- 完了予定: <t:${targetUnix}:T> (<t:${targetUnix}:R>)\n- 通知先: <#${channel.id}>`,
            });
        }
        else if (subcommand === "status") {
            const current = timerManager.getCurrentTimer();
            if (!current) {
                await interaction.reply({
                    content: "現在稼働中のタイマーはありません。",
                    ephemeral: true,
                });
                return;
            }
            const now = Date.now();
            const diffMs = current.targetTime - now;
            if (diffMs <= 0) {
                await interaction.reply({
                    content: "タイマーの予定時刻に到達しています。まもなく通知が行われます。",
                    ephemeral: true,
                });
                return;
            }
            const targetUnix = Math.floor(current.targetTime / 1000);
            await interaction.reply({
                content: `⏰ **現在のタイマー状態**\n- 完了予定: <t:${targetUnix}:T> (<t:${targetUnix}:R>)\n- 通知先チャンネル: <#${current.channelId}>`,
                ephemeral: true,
            });
        }
        else if (subcommand === "cancel") {
            const cancelled = await timerManager.cancelTimer();
            if (cancelled) {
                await interaction.reply("稼働中のタイマーをキャンセルしました。");
            }
            else {
                await interaction.reply({
                    content: "キャンセルするタイマーはありません。",
                    ephemeral: true,
                });
            }
        }
    },
};
