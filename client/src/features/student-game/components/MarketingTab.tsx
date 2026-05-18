import type { Dispatch, SetStateAction } from "react";
import { marketingOptions } from "../constants";
import type { TeamAssignment } from "../types";
import { formatMoney } from "../utils";
import { Badge, Button, Card } from "./ui";

export function MarketingTab({
  team,
  marketingSpend,
  setMarketingSpend,
  totalMarketing,
  onMarketing,
  decisionOpen,
}: {
  team: TeamAssignment;
  marketingSpend: Record<string, number>;
  setMarketingSpend: Dispatch<SetStateAction<Record<string, number>>>;
  totalMarketing: number;
  onMarketing: (spend: Record<string, number>) => void;
  decisionOpen: boolean;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Marketing</h2>
          <p className="text-sm text-slate-500">
            Publicity choices affect fan growth. Merchandise choices affect revenue.
          </p>
        </div>
        <Badge>
          Planned {formatMoney(totalMarketing)} / {formatMoney(team.budget)}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {marketingOptions.map((option) => (
          <Card key={option.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{option.name}</h3>
                  <Badge>{option.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{option.impact}</p>
              </div>
              <Badge>{formatMoney(option.cost)}</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="number"
                min={0}
                max={team.budget}
                step={1}
                value={marketingSpend[option.id] ?? option.cost}
                disabled={!decisionOpen}
                onChange={(event) =>
                  setMarketingSpend({
                    ...marketingSpend,
                    [option.id]: Number(event.target.value),
                  })
                }
                className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                aria-label={`${option.name} budget`}
              />
              <Button
                type="button"
                disabled={!decisionOpen}
                onClick={() => {
                  const nextSpend = {
                    ...marketingSpend,
                    [option.id]: marketingSpend[option.id] ?? option.cost,
                  };
                  setMarketingSpend(nextSpend);
                  onMarketing(nextSpend);
                }}
              >
                Save
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
