import { Gift, Images, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";

import TierBadge from "../components/TierBadge";
import { useAuth } from "../context/AuthContext";
import { TIER_LABELS, TIER_ORDER, TIER_THRESHOLDS } from "../api/types";

export default function Dashboard() {
  const { client } = useAuth();
  if (!client) return null;

  const tierIndex = TIER_ORDER.indexOf(client.loyalty_tier);
  const nextTier = TIER_ORDER[tierIndex + 1];
  const progress = nextTier
    ? Math.min(100, Math.round((TIER_THRESHOLDS[client.loyalty_tier] / TIER_THRESHOLDS[nextTier]) * 100))
    : 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">Здравствуйте,</p>
        <h1 className="text-2xl font-semibold text-gray-900">{client.name}</h1>
      </div>

      <div className="rounded-xl2 bg-brand p-6 text-white">
        <p className="text-sm text-white/70">Баланс бонусов</p>
        <p className="mt-1 text-4xl font-bold">{client.bonus_balance} ₽</p>
        <div className="mt-4 flex items-center justify-between">
          <TierBadge tier={client.loyalty_tier} />
          <span className="text-sm text-white/80">Кэшбэк {Math.round(client.cashback_percent * 100)}%</span>
        </div>
        {nextTier && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-brand-accent" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-white/70">
              До уровня «{TIER_LABELS[nextTier]}» — от {TIER_THRESHOLDS[nextTier].toLocaleString("ru-RU")} ₽ покупок
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/catalog" className="flex flex-col gap-2 rounded-xl2 bg-white p-4 shadow-sm">
          <ShoppingBag className="text-brand" size={22} />
          <span className="text-sm font-medium text-gray-800">Каталог</span>
        </Link>
        <Link to="/bonuses" className="flex flex-col gap-2 rounded-xl2 bg-white p-4 shadow-sm">
          <Gift className="text-brand" size={22} />
          <span className="text-sm font-medium text-gray-800">Мои бонусы</span>
        </Link>
        <Link to="/referral" className="flex flex-col gap-2 rounded-xl2 bg-white p-4 shadow-sm">
          <Users className="text-brand" size={22} />
          <span className="text-sm font-medium text-gray-800">Пригласить друга</span>
        </Link>
        <Link to="/content" className="flex flex-col gap-2 rounded-xl2 bg-white p-4 shadow-sm">
          <Images className="text-brand" size={22} />
          <span className="text-sm font-medium text-gray-800">Контент бренда</span>
        </Link>
      </div>

      {/* TODO: подключить реальный баннер акции */}
      <div className="rounded-xl2 bg-brand-accent/15 p-4 text-sm text-gray-800">
        🎉 Скоро здесь появится информация о новой акции
      </div>
    </div>
  );
}
