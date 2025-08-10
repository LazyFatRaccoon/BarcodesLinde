import { useState } from "react";
import axios from "../api/axios";

const ROLES = ["depo", "receiving", "filling", "manager", "repair", "admin"];

export default function AdminUsersPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "manager",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const { data } = await axios.post("/users", form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-xl font-semibold mb-4">Створити користувача</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          Ім’я
          <input
            className="input text-black w-full"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </label>
        <label className="block">
          Email
          <input
            className="input text-black w-full"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block">
          Роль
          <select
            className="input text-black w-full"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary" type="submit">
          Створити
        </button>
      </form>

      {error && <div className="text-red-600 mt-3">{error}</div>}
      {result && (
        <div className="mt-4 border rounded p-3">
          <div>
            Користувача створено: <b>{result.email}</b>
          </div>
          {/* у проді пароль на екрані краще не показувати */}
          {result.tempPassword && (
            <div>
              Тимчасовий пароль: <code>{result.tempPassword}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
