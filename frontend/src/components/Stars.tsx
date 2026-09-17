import { Star } from "lucide-react";

export default function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(rating) ? "fill-brand-accent text-brand-accent" : "text-gray-300"}
        />
      ))}
    </div>
  );
}
