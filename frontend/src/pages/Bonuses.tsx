import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import type { BonusEvent } from "../api/types";
import TierBadge from "../components/TierBadge";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

export default function Bonuses() {
  const { client } = useAuth();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<BonusEvent[]>("/me/bonuses")
      .then(setEvents)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (!client) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">Мои бонусы</h1>

      <div className="rounded-xl2 bg-brand p-6 text-white">
        <p className="text-sm text-white/70">Текущий баланс</p>
        <p className="mt-1 text-3xl font-bold">{client.bonus_balance} ₽</p>
        <div className="mt-3">
          <TierBadge tier={client.loyalty_tier} />
        </div>
      </div>

      <Link to="/referral" className="rounded-xl2 bg-white p-4 text-sm font-medium text-brand shadow-sm">
        Пригласить друга и получить бонус →
      </Link>

      {error && <ErrorBanner message={error} />}
      {loading && <p className="text-sm text-gray-400">Загрузка...</p>}

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900">История</h2>
        {events.length === 0 && !loading && <p className="text-sm text-gray-400">Пока нет операций</p>}
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-xl2 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm text-gray-900">{event.reason}</p>
              <p className="text-xs text-gray-400">{new Date(event.created_at).toLocaleDateString("ru-RU")}</p>
            </div>
            <span className={`text-sm font-semibold ${event.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
              {event.amount >= 0 ? "+" : ""}
              {event.amount} ₽
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
