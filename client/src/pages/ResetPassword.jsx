import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordRequest } from "../api/password";
import { Card, Button, Input, Label, Message } from "../components/ui";

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get("token");
  const navigate = useNavigate();

  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) setMsg("Невірне або відсутнє посилання для скидання.");
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!pwd || pwd.length < 6)
      return setMsg("Пароль має містити щонайменше 6 символів");
    if (pwd !== confirm) return setMsg("Паролі не співпадають");

    try {
      await resetPasswordRequest(token, pwd);
      setMsg("Пароль змінено. Тепер увійдіть з новим паролем.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setMsg(e.response?.data?.message || "Токен недійсний або прострочений");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <Card>
        <h1 className="text-xl font-bold mb-2">Новий пароль</h1>
        {msg && <Message message={msg} />}
        <form onSubmit={submit} className="space-y-2">
          <Label>Новий пароль</Label>
          <Input
            type="password"
            className="text-black"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            minLength={6}
            required
          />
          <Label>Підтвердження пароля</Label>
          <Input
            type="password"
            className="text-black"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            required
          />
          <Button>Зберегти</Button>
        </form>
      </Card>
    </div>
  );
}
