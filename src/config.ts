import "dotenv/config";

export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  GROUP_ID: Number(process.env.GROUP_ID) || 0,
  ADMIN_ID: Number(process.env.ADMIN_ID) || 0, // Додали ваш ID
  MONGO_URL: process.env.MONGO_URL || "",
};

if (!config.BOT_TOKEN || !config.GROUP_ID || !config.ADMIN_ID) {
  throw new Error("BOT_TOKEN, GROUP_ID або ADMIN_ID відсутні в .env файлі!");
}
