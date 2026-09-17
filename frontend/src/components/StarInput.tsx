import { Star } from "lucide-react";

export default function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-1">
          <Star size={28} className={n <= value ? "fill-brand-accent text-brand-accent" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}
