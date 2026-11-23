import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  type Message,
  REST,
  roleMention,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const DISBOARD_BOT_ID = "302050872383242240";
const BUMP_NOTIFICATION_ROLE_ID = "1573895073714671767";

const BUMP_INTERVAL_MS = 2 * 60 * 60 * 1000;

// Botごとに「成功」とみなすキーワード(小文字で記述)
const SUCCESS_KEYWORDS_BY_BOT_ID: Record<string, string[]> = {
  [DISBOARD_BOT_ID]: ["bump done", "表示順をアップ"],
};

function getEmbedText(message: Message): string {
  return message.embeds
    .map((embed) =>
      [
        embed.title,
        embed.description,
        embed.author?.name,
        embed.footer?.text,
        ...embed.fields.flatMap((field) => [field.name, field.value]),
      ]
        .filter((text): text is string => typeof text === "string")
        .join("\n"),
    )
    .join("\n");
}

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    throw new Error("DISCORD_TOKEN, CLIENT_ID, または GUILD_ID が設定されていません");
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`${readyClient.user.tag} としてログインしました`);
  });

  let bumpTimer: NodeJS.Timeout | null = null;

  client.on(Events.MessageCreate, async (message) => {
    if (message.guildId !== guildId) return;
    if (message.embeds.length === 0) return;

    // 送信者のBotに対応するキーワードがなければ無視
    const keywords = SUCCESS_KEYWORDS_BY_BOT_ID[message.author.id];
    if (!keywords) return;

    const embedText = getEmbedText(message);
    const lowerText = embedText.toLowerCase();
    const isSuccessMessage = keywords.some((keyword) => lowerText.includes(keyword));
    console.log("Bump embed keyword match", {
      authorId: message.author.id,
      keywords,
      isSuccessMessage,
      embedText,
    });
    if (!isSuccessMessage) return;

    const roleMentions = roleMention(BUMP_NOTIFICATION_ROLE_ID);

    console.log("/bump を検知しました。タイマーを開始します。");

    // 既存タイマーがあれば張り直す
    if (bumpTimer) clearTimeout(bumpTimer);

    const channel = message.channel;
    bumpTimer = setTimeout(async () => {
      bumpTimer = null;
      if (!channel.isSendable()) return;
      try {
        await channel.send({
          content: `${roleMentions} ⏰ **DISBOARDの /bump が可能になりました！**`,
          allowedMentions: { roles: [BUMP_NOTIFICATION_ROLE_ID] },
        });
      } catch (err) {
        console.error("Bump通知メッセージの送信に失敗しました:", err);
      }
    }, BUMP_INTERVAL_MS);

    // 通知系は失敗してもタイマーに影響しないよう個別に処理
    try {
      await message.reply("二時間タイマーを開始します!");
    } catch (err) {
      console.error("返信に失敗しました:", err);
    }
    try {
      await message.react("⏰");
    } catch (err) {
      console.error("リアクションの付与に失敗しました:", err);
    }
  });

  await client.login(token);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
