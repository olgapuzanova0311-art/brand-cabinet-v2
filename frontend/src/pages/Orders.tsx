import { useEffect, useState } from "react";

import { api } from "../api/client";
import type { Order } from "../api/types";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "../api/types";
import ErrorBanner from "../components/ErrorBanner";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Order[]>("/me/orders")
      .then(setOrders)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">Мои заявки</h1>

      {error && <ErrorBanner message={error} />}
      {loading && <p className="text-sm text-gray-400">Загрузка...</p>}
      {!loading && orders.length === 0 && <p className="text-sm text-gray-400">Заявок пока нет</p>}

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id} className="flex gap-3 rounded-xl2 bg-white p-4 shadow-sm">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {order.product.image_url && (
                <img src={order.product.image_url} alt={order.product.title} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{order.product.title}</p>
              <p className="text-xs text-gray-500">
                {order.quantity} шт. · {(order.product.price * order.quantity).toLocaleString("ru-RU")} ₽
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
            <span
              className={`h-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
