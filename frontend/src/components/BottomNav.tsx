import { Gift, Home, ShoppingBag, User, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Главная", icon: Home },
  { to: "/catalog", label: "Каталог", icon: ShoppingBag },
  { to: "/orders", label: "Заявки", icon: FileText },
  { to: "/bonuses", label: "Бонусы", icon: Gift },
  { to: "/profile", label: "Профиль", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md justify-between px-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? "text-brand" : "text-gray-400"
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
