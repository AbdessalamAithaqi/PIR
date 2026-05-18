import type { FormEvent } from "react";
import { useI18n } from "../../../i18n";
import { Badge, Button, Card } from "./ui";

export function JoinScreen({
  joinCode,
  submitting,
  error,
  onSubmit,
  onJoinCodeChange,
}: {
  joinCode: string;
  submitting: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onJoinCodeChange: (value: string) => void;
}) {
  const { t } = useI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <Badge>{t("student.join.badge")}</Badge>
          <h1 className="mt-4 text-2xl font-semibold">{t("student.join.title")}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("student.join.description")}</p>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="class-code" className="text-sm font-medium text-slate-700">
              {t("student.join.classCode")}
            </label>
            <input
              id="class-code"
              type="text"
              value={joinCode}
              onChange={(event) => onJoinCodeChange(event.target.value.toUpperCase())}
              placeholder="ABC123"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={12}
              className="h-11 rounded-md border border-slate-200 bg-white px-3 font-mono text-lg uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              aria-describedby={error ? "join-error" : undefined}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error && (
            <p
              id="join-error"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? t("student.join.submitting") : t("student.join.submit")}
          </Button>
        </form>
      </Card>
    </main>
  );
}
