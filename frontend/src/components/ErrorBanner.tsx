import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertTriangle size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
