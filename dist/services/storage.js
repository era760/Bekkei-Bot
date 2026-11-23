import fs from "node:fs/promises";
import path from "node:path";
import { CONFIG } from "../config.js";
export async function saveTimerData(data) {
    const filePath = path.resolve(CONFIG.TIMER_STORAGE_PATH);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
export async function loadTimerData() {
    const filePath = path.resolve(CONFIG.TIMER_STORAGE_PATH);
    try {
        const raw = await fs.readFile(filePath, "utf-8");
        return JSON.parse(raw);
    }
    catch (error) {
        if (error && error.code === "ENOENT") {
            return null;
        }
        console.error("タイマーデータの読み込み中にエラーが発生しました:", error);
        return null;
    }
}
export async function clearTimerData() {
    const filePath = path.resolve(CONFIG.TIMER_STORAGE_PATH);
    try {
        await fs.unlink(filePath);
    }
    catch (error) {
        if (error && error.code !== "ENOENT") {
            console.error("タイマーデータの削除中にエラーが発生しました:", error);
        }
    }
}
