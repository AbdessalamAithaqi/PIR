import { parameterKeys, parameterLabels } from "../constants";
import type { GameParameters } from "../types";
import { Button, Card } from "./ui";

export function ParametersTab({
  parameters,
  saving,
  onChange,
  onSave,
}: {
  parameters: GameParameters;
  saving: boolean;
  onChange: (parameters: GameParameters) => void;
  onSave: (parameters: GameParameters) => void;
}) {
  return (
    <Card className="max-w-3xl p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">Game parameters</h2>
          <p className="text-sm text-slate-500">Tune global simulation variables.</p>
        </div>
        <Button type="button" disabled={saving} onClick={() => onSave(parameters)}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="grid gap-5">
        {parameterKeys.map((key) => (
          <label key={key} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{parameterLabels[key]}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={parameters[key]}
                onChange={(event) =>
                  onChange({
                    ...parameters,
                    [key]: Number(event.target.value),
                  })
                }
                className="h-9 w-20 rounded-md border border-slate-200 px-2 text-center text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={parameters[key]}
              onChange={(event) =>
                onChange({
                  ...parameters,
                  [key]: Number(event.target.value),
                })
              }
              className="w-full accent-slate-950"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}
