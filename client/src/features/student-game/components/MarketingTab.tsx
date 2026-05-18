import type { Dispatch, SetStateAction } from "react";
import { useI18n } from "../../../i18n";
import type { TranslationKey } from "../../../i18n";
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
  const { t } = useI18n();

  return (
    <div className="grid gap-5" data-student-marketing-root="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t("student.marketing.title")}</h2>
          <p className="text-sm text-slate-500">
            {t("student.marketing.description")}
          </p>
        </div>
        <Badge>
          {t("student.marketing.planned", {
            planned: formatMoney(totalMarketing),
            budget: formatMoney(team.budget),
          })}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {marketingOptions.map((option) => {
          const name = t(`student.marketing.${option.id}.name` as TranslationKey);
          const impact = t(`student.marketing.${option.id}.impact` as TranslationKey);
          const category =
            option.category === "Publicity"
              ? t("student.marketing.category.publicity")
              : t("student.marketing.category.merchandise");

          return (
            <Card key={option.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{name}</h3>
                    <Badge>{category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{impact}</p>
                </div>
                <Badge>{formatMoney(option.cost)}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="number"
                  data-marketing-input="true"
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
                  aria-label={`${name} ${t("common.budget")}`}
                />
                <Button
                  type="button"
                  disabled={!decisionOpen}
                  data-marketing-save="true"
                  onClick={() => {
                    const nextSpend = {
                      ...marketingSpend,
                      [option.id]: marketingSpend[option.id] ?? option.cost,
                    };
                    setMarketingSpend(nextSpend);
                    onMarketing(nextSpend);
                  }}
                >
                  {t("common.save")}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
