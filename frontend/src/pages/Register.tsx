import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("referral_code") || undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, phone: phone || undefined, password, referral_code: referralCode });
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
        <h1 className="text-2xl font-semibold text-gray-900">Регистрация</h1>
        <p className="mt-1 text-sm text-gray-500">Создайте аккаунт, чтобы копить бонусы</p>
      </div>

      {referralCode && (
        <div className="rounded-xl bg-brand-accent/10 px-4 py-3 text-sm text-gray-800">
          Тебя пригласил друг — вы оба получите бонус после регистрации 🎁
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          placeholder="Телефон (необязательно)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Уже есть аккаунт?{" "}
        <Link to="/login" className="font-medium text-brand">
          Войти
        </Link>
      </p>
    </div>
  );
}
