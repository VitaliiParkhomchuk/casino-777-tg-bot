import fs from "node:fs/promises";

export interface User {
  id: number;
  username?: string;
  first_name: string;
}

const DB_PATH = "./users.json";

export async function saveUser(user: User) {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8").catch(() => "[]");
    const users: User[] = JSON.parse(data);

    // Додаємо лише якщо юзера ще немає
    if (!users.find((u) => u.id === user.id)) {
      users.push(user);
      await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
    }
  } catch (e) {
    console.error("Помилка при збереженні юзера:", e);
  }
}

export async function getUsers(): Promise<User[]> {
  const data = await fs.readFile(DB_PATH, "utf-8").catch(() => "[]");
  return JSON.parse(data);
}
