import express, { type Request, type Response } from "express"; // Додали Request та Response
import { Bot, GrammyError, HttpError } from "grammy";
import { config } from "./config.js";
import { saveUser, getUsers } from "./db.js";

// Створюємо міні-сервер
const app = express();

// Явно вказуємо типи для req та res
app.get("/", (req: Request, res: Response) => {
  res.send("Бот Джарвіс працює!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Веб-сервер запущено на порту ${port}`);
});

const bot = new Bot(config.BOT_TOKEN);

// --- BEST PRACTICE: РЕЄСТРАЦІЯ КОМАНД ---
// Це дозволяє команді з'являтися в підказках (меню "/")
async function setupBotCommands() {
  await bot.api.setMyCommands([
    { command: "all", description: "Покликати всіх учасників групи" },
    { command: "test", description: "Перевірити, чи живий бот (працює в ЛС)" },
    // Тут можна додати інші команди в майбутньому
  ]);
  console.log("📜 Команди бота зареєстровані в Telegram!");
}
setupBotCommands();

// --- ПЕРЕВІРКА ГРУПИ ---
bot.use(async (ctx, next) => {
  const isTargetGroup = ctx.chat?.id === config.GROUP_ID;
  const isOwnerPrivate =
    ctx.chat?.type === "private" && ctx.from?.id === config.ADMIN_ID;

  if (isTargetGroup || isOwnerPrivate) {
    return next();
  }

  // Якщо хтось інший пише в ЛС
  if (ctx.chat?.type === "private") {
    console.log(`Спроба доступу від стороннього юзера ID: ${ctx.from?.id}`);
    await ctx.reply("Вибачте, цей бот приватний. Доступ лише для власника.");
  }

  // В усіх інших випадках (інші групи) - просто мовчимо
  return;
});

// --- ЗБІР ЮЗЕРІВ ---
bot.on("message", async (ctx, next) => {
  if (ctx.from && !ctx.from.is_bot) {
    await saveUser({
      id: ctx.from.id,
      username: ctx.from.username,
      first_name: ctx.from.first_name,
    });
  }
  return next();
});

// --- КОМАНДА /ALL (замість @all) ---
bot.command("all", async (ctx) => {
  const users = await getUsers();

  // Фільтруємо самого автора (за бажанням)
  const otherUsers = users.filter((u) => u.id !== ctx.from?.id);

  if (otherUsers.length === 0) {
    return ctx.reply("Я ще нікого не знаю в цій групі, крім тебе.");
  }

  const mentions = otherUsers
    .map((u) => {
      if (u.username) return `@${u.username}`;
      return `<a href="tg://user?id=${u.id}">${u.first_name}</a>`;
    })
    .join(" ");

  await ctx.reply(`${mentions}`, {
    parse_mode: "HTML",
  });
});

bot.hears(["@all"], async (ctx) => {
  const users = await getUsers();

  // Фільтруємо самого автора (за бажанням)
  const otherUsers = users.filter((u) => u.id !== ctx.from?.id);

  if (otherUsers.length === 0) {
    return ctx.reply("Я ще нікого не знаю в цій групі, крім тебе.");
  }

  const mentions = otherUsers
    .map((u) => {
      if (u.username) return `@${u.username}`;
      return `<a href="tg://user?id=${u.id}">${u.first_name}</a>`;
    })
    .join(" ");

  await ctx.reply(`${mentions}`, {
    parse_mode: "HTML",
  });
});

bot.command("test", async (ctx) => {
  await ctx.reply("✅ Бот Джарвіс на зв'язку! Все працює коректно.");
});

// --- ОБРОБКА ПОМИЛОК ---
bot.catch((err) => {
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Помилка Telegram API:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Помилка мережі:", e);
  } else {
    console.error("Невідома помилка:", e);
  }
});

bot.start();
console.log("✅ Бот успішно запущений!");
