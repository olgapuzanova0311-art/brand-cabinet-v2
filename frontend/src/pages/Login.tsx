import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Вход</h1>
        <p className="mt-1 text-sm text-gray-500">Рады видеть вас снова</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Входим..." : "Войти"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Нет аккаунта?{" "}
        <Link to="/register" className="font-medium text-brand">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
