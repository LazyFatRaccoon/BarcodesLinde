import { useState } from "react";
import { forgotPasswordRequest } from "../api/password";
import { Card, Button, Input, Label, Message } from "../components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await forgotPasswordRequest(email);
      setSent(true);
    } catch (e) {
      setErr(e.response?.data?.message || "Помилка надсилання листа");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <Card>
        <h1 className="text-xl font-bold mb-2">Відновлення пароля</h1>
        {sent ? (
          <Message message="Якщо акаунт існує, на вашу пошту відправлено інструкції." />
        ) : (
          <form onSubmit={submit} className="space-y-2">
            {err && <Message message={err} />}
            <Label>Email</Label>
            <Input
              type="email"
              className="text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button>Надіслати посилання</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
