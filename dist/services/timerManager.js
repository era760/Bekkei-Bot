import { roleMention } from "discord.js";
import { CONFIG } from "../config.js";
import { clearTimerData, loadTimerData, saveTimerData } from "./storage.js";
export class TimerManager {
    activeTimer = null;
    currentTimerData = null;
    /**
     * タイマーを開始または再設定する
     */
    async startTimer(channel, durationMs = CONFIG.BUMP_INTERVAL_MS, guildId = CONFIG.GUILD_ID) {
        await this.cancelTimer();
        const now = Date.now();
        const targetTime = now + durationMs;
        const timerData = {
            targetTime,
            startedAt: now,
            channelId: channel.id,
            guildId,
        };
        this.currentTimerData = timerData;
        await saveTimerData(timerData);
        this.scheduleTimeout(channel, durationMs);
        return timerData;
    }
    /**
     * 現在稼働中のタイマーをキャンセルする
     */
    async cancelTimer() {
        if (this.activeTimer) {
            clearTimeout(this.activeTimer);
            this.activeTimer = null;
        }
        const hadTimer = this.currentTimerData !== null;
        this.currentTimerData = null;
        await clearTimerData();
        return hadTimer;
    }
    /**
     * 現在のタイマー情報を取得する
     */
    getCurrentTimer() {
        return this.currentTimerData;
    }
    /**
     * 起動時に保存されたタイマー情報を復元する
     */
    async restoreTimer(client) {
        const saved = await loadTimerData();
        if (!saved)
            return;
        this.currentTimerData = saved;
        const now = Date.now();
        const remainingMs = saved.targetTime - now;
        try {
            const channel = await client.channels.fetch(saved.channelId);
            if (!channel || !channel.isSendable()) {
                console.warn(`タイマー復元警告: チャンネル ${saved.channelId} が見つからないか送信不可能です。タイマーをクリアします。`);
                await this.cancelTimer();
                return;
            }
            if (remainingMs <= 0) {
                console.log("タイマー復元: 停止中に予定時刻を過ぎていたため、即座に通知を送信します。");
                await this.sendNotification(channel, true);
                await this.cancelTimer();
            }
            else {
                const remainingMinutes = Math.max(1, Math.round(remainingMs / 1000 / 60));
                console.log(`タイマー復元: 残り約 ${remainingMinutes} 分でタイマーを再開します。`);
                this.scheduleTimeout(channel, remainingMs);
            }
        }
        catch (error) {
            console.error("タイマー復元処理中にエラーが発生しました:", error);
        }
    }
    scheduleTimeout(channel, delayMs) {
        this.activeTimer = setTimeout(async () => {
            this.activeTimer = null;
            await this.sendNotification(channel);
            await this.cancelTimer();
        }, delayMs);
    }
    async sendNotification(channel, wasDelayed = false) {
        if (!channel.isSendable())
            return;
        try {
            const mention = roleMention(CONFIG.BUMP_NOTIFICATION_ROLE_ID);
            const delayNote = wasDelayed ? "\n*(※ボット再起動中に2時間が経過しました)*" : "";
            await channel.send({
                content: `${mention}  **DISBOARDの /bump が可能になりました！**${delayNote}`,
                allowedMentions: { roles: [CONFIG.BUMP_NOTIFICATION_ROLE_ID] },
            });
        }
        catch (err) {
            console.error("Bump通知メッセージの送信に失敗しました:", err);
        }
    }
}
export const timerManager = new TimerManager();
