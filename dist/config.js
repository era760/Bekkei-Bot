import "dotenv/config";
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
if (!token || !clientId || !guildId) {
    throw new Error("DISCORD_TOKEN, CLIENT_ID, または GUILD_ID が環境変数に設定されていません");
}
export const CONFIG = {
    DISCORD_TOKEN: token,
    CLIENT_ID: clientId,
    GUILD_ID: guildId,
    DISBOARD_BOT_ID: "302050872383242240",
    BUMP_NOTIFICATION_ROLE_ID: "1573895073714671767",
    BUMP_INTERVAL_MS: 2 * 60 * 60 * 1000,
    TIMER_STORAGE_PATH: "./data/timer.json",
    // Botごとに「成功」とみなすキーワード(小文字で記述)
    SUCCESS_KEYWORDS_BY_BOT_ID: {
        "302050872383242240": ["bump done", "表示順をアップ"],
    },
};
