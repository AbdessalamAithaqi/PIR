import type { Dispatch, SetStateAction } from "react";
import type { MarketPlayer, ServerBid, TeamAssignment } from "../types";
import { formatMoney, toPlayer } from "../utils";
import { Badge, Button, Card } from "./ui";

export function MarketTab({
  team,
  market,
  serverBids,
  bids,
  setBids,
  totalReserved,
  onBid,
  onRefresh,
  refreshing,
  decisionOpen,
}: {
  team: TeamAssignment;
  market: MarketPlayer[];
  serverBids: ServerBid[];
  bids: Record<string, number>;
  setBids: Dispatch<SetStateAction<Record<string, number>>>;
  totalReserved: number;
  onBid: (playerId: string, amount: number) => void;
  onRefresh: () => void;
  refreshing: boolean;
  decisionOpen: boolean;
}) {
  const availablePlayers = market.map(toPlayer);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Market</h2>
          <p className="text-sm text-slate-500">
            {decisionOpen ? "Reserve budget by placing bids on available players." : "Market decisions are locked."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Reserved {formatMoney(totalReserved)}</Badge>
          <Button type="button" variant="secondary" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh market"}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-200">
          {availablePlayers.map((player) => {
            const highestBid = serverBids
              .filter((bid) => bid.playerId === player.id)
              .reduce((max, bid) => Math.max(max, bid.amount), 0);
            const startingPrice = player.price ?? 0;
            const minimumBid = Math.max(startingPrice, highestBid > 0 ? highestBid + 1 : startingPrice);
            const bid = bids[player.id] ?? minimumBid;
            const invalidBid = !Number.isFinite(bid) || bid < minimumBid || bid > team.budget;

            return (
              <div key={player.id} className="grid gap-3 p-4 md:grid-cols-[1fr_180px_96px] md:items-center">
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-slate-500">
                    {player.position} - OVR {player.rating} - Start {formatMoney(startingPrice)}
                  </p>
                  {highestBid > 0 && (
                    <p className="mt-1 text-xs text-slate-500">Current high bid {formatMoney(highestBid)}</p>
                  )}
                </div>
                <input
                  type="number"
                  min={minimumBid}
                  max={team.budget}
                  step={1}
                  inputMode="numeric"
                  value={bid}
                  disabled={!decisionOpen}
                  onChange={(event) =>
                    setBids({
                      ...bids,
                      [player.id]: Number(event.target.value),
                    })
                  }
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  aria-label={`${player.name} bid`}
                />
                <Button type="button" disabled={!decisionOpen || invalidBid} onClick={() => onBid(player.id, bid)}>
                  Bid
                </Button>
              </div>
            );
          })}
          {availablePlayers.length === 0 && (
            <p className="p-6 text-sm text-slate-500">
              {decisionOpen
                ? "No market players are available yet. Refresh the market or ask the professor to relaunch the round."
                : "The market opens when the professor launches a round."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
