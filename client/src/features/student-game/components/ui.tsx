import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useI18n } from "../../../i18n";
import { cn } from "../utils";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-slate-950 text-white hover:bg-slate-800",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-950 hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const { t } = useI18n();

  return (
    <div
      className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-md border border-red-200 bg-white p-4 text-slate-950 shadow-xl"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-700">{t("common.actionNeeded")}</p>
          <p className="mt-1 text-sm text-slate-700">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-950"
        >
          {t("common.dismiss")}
        </button>
      </div>
    </div>
  );
}
