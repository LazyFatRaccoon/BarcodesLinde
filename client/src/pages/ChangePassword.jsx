import { useState } from "react";
import axios from "../api/axios";

export default function ChangePasswordPage() {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.post("/users/change-password", { oldPassword, newPassword });
      setMsg("Пароль змінено");
      setOld("");
      setNew("");
    } catch (err) {
      setMsg(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h1 className="text-xl font-semibold mb-4">Зміна пароля</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          Поточний пароль
          <input
            className="input text-black w-full"
            type="password"
            value={oldPassword}
            onChange={(e) => setOld(e.target.value)}
          />
        </label>
        <label className="block">
          Новий пароль
          <input
            className="input text-black w-full"
            type="password"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
          />
        </label>
        <button className="btn-primary" type="submit">
          Змінити
        </button>
      </form>
      {msg && <div className="mt-3">{msg}</div>}
    </div>
  );
}
