import { Link } from "react-router-dom";
import { useI18n } from "../../../i18n";

export function MissingGameState({ error }: { error: string }) {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
      <Link to="/teacher" className="text-sm font-medium text-slate-700 hover:text-slate-950">
        {t("common.back")}
      </Link>
      <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error || t("teacherGame.notFound")}
      </p>
    </main>
  );
}
