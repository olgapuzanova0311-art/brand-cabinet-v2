import { useState } from "react";
import { Images, LogOut, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { client, logout, refreshClient } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(client?.name || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!client) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await api.patch("/me", { name, phone: phone || undefined });
      await refreshClient();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">Профиль</h1>

      {error && <ErrorBanner message={error} />}
      {saved && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Сохранено</div>}

      <form onSubmit={handleSave} className="flex flex-col gap-3 rounded-xl2 bg-white p-4 shadow-sm">
        <label className="text-xs text-gray-400">Email</label>
        <input value={client.email} disabled className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400" />

        <label className="text-xs text-gray-400">Имя</label>
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="text-xs text-gray-400">Телефон</label>
        <input
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Сохраняем..." : "Сохранить"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <Link to="/content" className="flex items-center gap-3 rounded-xl2 bg-white p-4 text-sm text-gray-800 shadow-sm">
          <Images size={18} className="text-brand" /> Контент бренда
        </Link>
        <Link to="/social" className="flex items-center gap-3 rounded-xl2 bg-white p-4 text-sm text-gray-800 shadow-sm">
          <Share2 size={18} className="text-brand" /> Мы в соцсетях
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600"
      >
        <LogOut size={16} /> Выйти
      </button>
    </div>
  );
}
