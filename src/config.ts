import "dotenv/config";

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  GROUP_ID: Number(process.env.GROUP_ID) || 0, // Перетворюємо рядок на число
};

if (!config.BOT_TOKEN || !config.GROUP_ID) {
  throw new Error("BOT_TOKEN або GROUP_ID відсутні в .env файлі!");
}
