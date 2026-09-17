import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

// TODO: заменить на реальный контент бренда (можно подключить к CMS/API позже)
const CONTENT_ITEMS = [
  {
    title: "Как ухаживать за изделиями",
    image: "",
    description: "Советы по уходу, чтобы вещи служили дольше.",
    link: "#",
  },
  {
    title: "Новая коллекция",
    image: "",
    description: "Смотрите первыми — что мы приготовили в этом сезоне.",
    link: "#",
  },
  {
    title: "История бренда",
    image: "",
    description: "С чего всё начиналось и куда мы движемся.",
    link: "#",
  },
];

export default function Content() {
  return (
    <div className="flex flex-col gap-4">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-500">
        <ArrowLeft size={16} /> Назад
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900">Контент бренда</h1>

      <div className="flex flex-col gap-3">
        {CONTENT_ITEMS.map((item) => (
          <a
            key={item.title}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col overflow-hidden rounded-xl2 bg-white shadow-sm"
          >
            <div className="flex h-32 items-center justify-center bg-gray-100 text-gray-300">
              {item.image ? (
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                "Изображение"
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <ExternalLink size={14} className="text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
