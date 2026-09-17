import { useEffect, useState } from "react";
import { Check, Copy, Send } from "lucide-react";

import { api } from "../api/client";
import type { ReferralStats } from "../api/types";
import ErrorBanner from "../components/ErrorBanner";

export default function Referral() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get<ReferralStats>("/me/referral")
      .then(setStats)
      .catch((err) => setError((err as Error).message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!stats) return <p className="text-sm text-gray-400">Загрузка...</p>;

  const fullLink = `${window.location.origin}${stats.referral_link}`;

  function copyLink() {
    navigator.clipboard.writeText(fullLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareTelegram() {
    const text = encodeURIComponent("Присоединяйся и получи бонус на первую покупку!");
    window.open(`https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${text}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">Пригласить друга</h1>
      <p className="text-sm text-gray-500">
        Поделитесь своей ссылкой — вы получите бонус, когда друг оформит первый заказ
      </p>

      <div className="rounded-xl2 bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-400">Ваш код</p>
        <p className="mt-1 text-lg font-semibold tracking-widest text-gray-900">{stats.referral_code}</p>
        <p className="mt-3 break-all rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">{fullLink}</p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={copyLink}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-medium text-white"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Скопировано" : "Скопировать ссылку"}
          </button>
          <button
            onClick={shareTelegram}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3 text-sm font-medium text-white"
          >
            <Send size={16} />
            Telegram
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl2 bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-semibold text-gray-900">{stats.invited_count}</p>
          <p className="mt-1 text-xs text-gray-500">Регистраций</p>
        </div>
        <div className="rounded-xl2 bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-semibold text-gray-900">{stats.rewarded_count}</p>
          <p className="mt-1 text-xs text-gray-500">Принесли бонус</p>
        </div>
        <div className="rounded-xl2 bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-semibold text-gray-900">{stats.total_earned} ₽</p>
          <p className="mt-1 text-xs text-gray-500">Заработано</p>
        </div>
      </div>
    </div>
  );
}
