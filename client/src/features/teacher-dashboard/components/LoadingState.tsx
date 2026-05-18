import { useI18n } from "../../../i18n";

export function LoadingState() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
      <div className="mx-auto max-w-5xl text-sm text-slate-500">{t("teacherDashboard.loading")}</div>
    </main>
  );
}
