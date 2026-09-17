import { Award } from "lucide-react";

import type { Client } from "../api/types";
import { TIER_LABELS } from "../api/types";

const TIER_STYLES: Record<Client["loyalty_tier"], string> = {
  bronze: "bg-tier-bronze/15 text-tier-bronze",
  silver: "bg-tier-silver/20 text-gray-600",
  gold: "bg-tier-gold/15 text-tier-gold",
};

export default function TierBadge({ tier }: { tier: Client["loyalty_tier"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${TIER_STYLES[tier]}`}
    >
      <Award size={16} />
      {TIER_LABELS[tier]}
    </span>
  );
}
