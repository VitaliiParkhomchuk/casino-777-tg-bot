import mongoose from "mongoose";
import { config } from "./config.js";

// 1. Створюємо інтерфейс для юзера (опис того, як виглядає об'єкт юзера)
export interface IUser {
  id: number;
  username?: string;
  first_name?: string;
  date_added?: Date;
}

// Підключаємося до бази
mongoose
  .connect(config.MONGO_URL)
  .then(() => console.log("📦 Підключено до MongoDB!"))
  .catch((err) => console.error("❌ Помилка підключення до MongoDB:", err));

// 2. Вказуємо тип <IUser> для схеми
const userSchema = new mongoose.Schema<IUser>({
  id: { type: Number, required: true, unique: true },
  username: String,
  first_name: String,
  date_added: { type: Date, default: Date.now },
});

// 3. Створюємо модель з типом <IUser>
const User = mongoose.model<IUser>("User", userSchema);

// 4. Додаємо тип : IUser до аргументу функції
export async function saveUser(userData: IUser) {
  try {
    await User.findOneAndUpdate({ id: userData.id }, userData, {
      upsert: true,
    });
  } catch (err) {
    console.error("Помилка при збереженні юзера:", err);
  }
}

// 5. Вказуємо, що функція повертає проміс із масивом юзерів Promise<IUser[]>
export async function getUsers(): Promise<IUser[]> {
  try {
    return await User.find({});
  } catch (err) {
    console.error("Помилка при отриманні юзерів:", err);
    return [];
  }
}
