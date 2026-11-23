import fs from "node:fs/promises";
import path from "node:path";
import { CONFIG } from "../config.js";
import type { TimerData } from "../types/index.js";

function isTimerData(data: unknown): data is TimerData {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.targetTime === "number" &&
    typeof obj.startedAt === "number" &&
    typeof obj.channelId === "string" &&
    obj.channelId.trim().length > 0 &&
    typeof obj.guildId === "string"
  );
}

export async function saveTimerData(data: TimerData): Promise<void> {
  const filePath = path.resolve(CONFIG.TIMER_STORAGE_PATH);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadTimerData(): Promise<TimerData | null> {
  const filePath = path.resolve(CONFIG.TIMER_STORAGE_PATH);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw);
    if (!isTimerData(parsed)) {
      console.warn("保存されていたタイマーデータの形式が無効または空のため破棄します。");
      await clearTimerData();
      return null;
    }
    return parsed;
  } catch (error: any) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    console.error("タイマーデータの読み込み中にエラーが発生しました:", error);
    return null;
  }
}

export async function clearTimerData(): Promise<void> {
  const filePath = path.resolve(CONFIG.TIMER_STORAGE_PATH);
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error && error.code !== "ENOENT") {
      console.error("タイマーデータの削除中にエラーが発生しました:", error);
    }
  }
}
