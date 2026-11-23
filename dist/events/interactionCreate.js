import { commands } from "../commands/index.js";
export async function handleInteractionCreate(interaction) {
    if (!interaction.isChatInputCommand())
        return;
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.warn(`未登録のコマンドが呼び出されました: ${interaction.commandName}`);
        return;
    }
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(`コマンド実行中にエラーが発生しました (${interaction.commandName}):`, error);
        const replyContent = {
            content: "コマンドの実行中にエラーが発生しました。",
            ephemeral: true,
        };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyContent).catch(() => { });
        }
        else {
            await interaction.reply(replyContent).catch(() => { });
        }
    }
}
