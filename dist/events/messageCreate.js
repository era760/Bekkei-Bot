import { CONFIG } from "../config.js";
import { timerManager } from "../services/timerManager.js";
function getEmbedText(message) {
    return message.embeds
        .map((embed) => [
        embed.title,
        embed.description,
        embed.author?.name,
        embed.footer?.text,
        ...embed.fields.flatMap((field) => [field.name, field.value]),
    ]
        .filter((text) => typeof text === "string")
        .join("\n"))
        .join("\n");
}
export async function handleMessageCreate(message) {
    if (message.guildId !== CONFIG.GUILD_ID)
        return;
    if (message.embeds.length === 0)
        return;
    const keywords = CONFIG.SUCCESS_KEYWORDS_BY_BOT_ID[message.author.id];
    if (!keywords)
        return;
    const embedText = getEmbedText(message);
    const lowerText = embedText.toLowerCase();
    const isSuccessMessage = keywords.some((keyword) => lowerText.includes(keyword));
    console.log("Bump embed keyword match", {
        authorId: message.author.id,
        keywords,
        isSuccessMessage,
        embedText,
    });
    if (!isSuccessMessage)
        return;
    console.log("/bump を検知しました。2時間タイマーを開始します。");
    // タイマーを開始（保存＆既存タイマー再設定）
    await timerManager.startTimer(message.channel, CONFIG.BUMP_INTERVAL_MS, message.guildId);
    // 通知系は失敗してもタイマーに影響しないよう個別に処理
    try {
        await message.reply("二時間タイマーを開始します!");
    }
    catch (err) {
        console.error("返信に失敗しました:", err);
    }
    try {
        await message.react("⏰");
    }
    catch (err) {
        console.error("リアクションの付与に失敗しました:", err);
    }
}
