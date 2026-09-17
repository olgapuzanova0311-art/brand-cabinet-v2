import { ArrowLeft, Instagram, MessageCircle, Send, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

// TODO: заменить на реальные ссылки соцсетей бренда
const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://instagram.com/", icon: Instagram, color: "bg-pink-50 text-pink-600" },
  { name: "Telegram", url: "https://t.me/", icon: Send, color: "bg-sky-50 text-sky-600" },
  { name: "YouTube", url: "https://youtube.com/", icon: Youtube, color: "bg-red-50 text-red-600" },
  { name: "WhatsApp", url: "https://wa.me/", icon: MessageCircle, color: "bg-green-50 text-green-600" },
];

export default function Social() {
  return (
    <div className="flex flex-col gap-4">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-500">
        <ArrowLeft size={16} /> Назад
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900">Мы в соцсетях</h1>

      <div className="flex flex-col gap-3">
        {SOCIAL_LINKS.map(({ name, url, icon: Icon, color }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-xl2 bg-white p-4 shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
              <Icon size={20} />
            </div>
            <span className="text-sm font-medium text-gray-900">{name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
