import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import type { Order, Product, Review } from "../api/types";
import ErrorBanner from "../components/ErrorBanner";
import Stars from "../components/Stars";
import StarInput from "../components/StarInput";
import { useAuth } from "../context/AuthContext";

function ReviewForm({ productId, onDone }: { productId: number; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("rating", String(rating));
      form.append("text", text);
      if (photo) form.append("photo", photo);
      await api.postForm(`/products/${productId}/reviews`, form);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl2 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-900">Оставить отзыв</p>
      {error && (
        <div className="mt-2">
          <ErrorBanner message={error} />
        </div>
      )}
      <div className="mt-3">
        <StarInput value={rating} onChange={setRating} />
      </div>
      <textarea
        className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand focus:outline-none"
        placeholder="Расскажите о товаре..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-brand">
        <ImagePlus size={18} />
        Добавить фото (+бонус)
        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </label>
      {preview && <img src={preview} alt="preview" className="mt-2 h-24 w-24 rounded-xl object-cover" />}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Отправляем..." : "Отправить отзыв"}
      </button>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { client } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if (!id) return;
    try {
      const [productData, reviewsData, ordersData] = await Promise.all([
        api.get<Product>(`/products/${id}`),
        api.get<Review[]>(`/products/${id}/reviews`),
        api.get<Order[]>("/me/orders"),
      ]);
      setProduct(productData);
      setReviews(reviewsData);

      const hasDoneOrder = ordersData.some((o) => o.product_id === Number(id) && o.status === "done");
      const alreadyReviewed = reviewsData.some((r) => r.client_id === client?.id);
      setCanReview(hasDoneOrder && !alreadyReviewed);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <ErrorBanner message={error} />;
  if (!product) return <p className="text-sm text-gray-400">Загрузка...</p>;

  return (
    <div className="flex flex-col gap-4">
      <Link to="/catalog" className="flex items-center gap-1 text-sm text-gray-500">
        <ArrowLeft size={16} /> Назад в каталог
      </Link>

      <div className="aspect-square w-full overflow-hidden rounded-xl2 bg-gray-100">
        {product.image_url && <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />}
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">{product.title}</h1>
        <p className="mt-1 text-lg font-semibold text-gray-900">{product.price.toLocaleString("ru-RU")} ₽</p>
        <div className="mt-1 flex items-center gap-1">
          <Stars rating={product.avg_rating} />
          <span className="text-sm text-gray-400">({product.reviews_count} отзывов)</span>
        </div>
        <p className="mt-3 text-sm text-gray-600">{product.description}</p>
      </div>

      {canReview && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-brand-accent py-3 text-sm font-medium text-white"
        >
          Оставить отзыв
        </button>
      )}
      {showForm && (
        <ReviewForm
          productId={product.id}
          onDone={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Отзывы</h2>
        <div className="mt-3 flex flex-col gap-3">
          {reviews.length === 0 && <p className="text-sm text-gray-400">Пока нет отзывов</p>}
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl2 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} size={14} />
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
              {review.text && <p className="mt-2 text-sm text-gray-700">{review.text}</p>}
              {review.photo_url && (
                <img src={review.photo_url} alt="review" className="mt-2 h-32 w-32 rounded-xl object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
