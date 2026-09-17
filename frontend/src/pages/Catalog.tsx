import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import type { Product } from "../api/types";
import ErrorBanner from "../components/ErrorBanner";
import Stars from "../components/Stars";

function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/orders", { product_id: product.id, quantity, comment: comment || undefined });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-lg font-semibold text-gray-900">Заявка отправлена!</p>
            <p className="text-sm text-gray-500">Следите за статусом в разделе «Мои заявки»</p>
            <button onClick={onClose} className="mt-2 rounded-xl bg-brand px-6 py-2 text-sm text-white">
              Понятно
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900">{product.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{product.price.toLocaleString("ru-RU")} ₽ за шт.</p>

            {error && (
              <div className="mt-3">
                <ErrorBanner message={error} />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-700">Количество</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full bg-gray-100 text-lg"
                >
                  −
                </button>
                <span className="w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-8 w-8 rounded-full bg-gray-100 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <textarea
              className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
              placeholder="Комментарий (необязательно)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />

            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700">
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Отправляем..." : "Оформить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);
    const path = collection ? `/products?collection=${encodeURIComponent(collection)}` : "/products";
    api
      .get<Product[]>(path)
      .then(setProducts)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [collection]);

  const collections = useMemo(
    () => Array.from(new Set(products.map((p) => p.collection).filter(Boolean))) as string[],
    [products],
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">Каталог</h1>

      {error && <ErrorBanner message={error} />}

      {collections.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setCollection(null)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
              collection === null ? "bg-brand text-white" : "bg-white text-gray-600"
            }`}
          >
            Все
          </button>
          {collections.map((c) => (
            <button
              key={c}
              onClick={() => setCollection(c)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                collection === c ? "bg-brand text-white" : "bg-white text-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Загрузка...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col overflow-hidden rounded-xl2 bg-white shadow-sm">
              <Link to={`/catalog/${product.id}`}>
                <div className="aspect-square w-full bg-gray-100">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">{product.title}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <Stars rating={product.avg_rating} size={12} />
                    <span className="text-xs text-gray-400">({product.reviews_count})</span>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setOrderingProduct(product)}
                disabled={!product.in_stock}
                className="mx-3 mb-3 rounded-xl bg-brand py-2 text-xs font-medium text-white disabled:bg-gray-200 disabled:text-gray-400"
              >
                {product.in_stock ? "Оформить заявку" : "Нет в наличии"}
              </button>
            </div>
          ))}
        </div>
      )}

      {orderingProduct && <OrderModal product={orderingProduct} onClose={() => setOrderingProduct(null)} />}
    </div>
  );
}
