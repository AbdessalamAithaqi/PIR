import { useI18n } from "../../../i18n";

export function LoadingState() {
  const { t } = useI18n();

  return <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">{t("teacherGame.loading")}</div>;
}
