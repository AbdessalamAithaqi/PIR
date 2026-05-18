import { useEffect } from "react";
import { getStoredLanguage, translateForLanguage } from "../i18n";
import { StudentJoinPage } from "./StudentJoinPage";

const MARKETING_INPUT_SELECTOR = 'input[data-marketing-input="true"]';
const SELECTED_ATTRIBUTE = "data-marketing-selected";
const WARNING_ID = "marketing-budget-warning";

function parseMoney(value: string) {
  const normalized = value.replace(/[^\d.,-]/g, "").replace(/[.,]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function getCurrentBudget() {
  const budgetMetric = document.querySelector('[data-student-metric="budget"]');
  const budgetValue = budgetMetric?.querySelectorAll("p")[1]?.textContent;
  return parseMoney(budgetValue ?? "");
}

function getMarketingRoot() {
  return document.querySelector<HTMLElement>('[data-student-marketing-root="true"]');
}

function getMarketingInputs() {
  const root = getMarketingRoot();
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLInputElement>(MARKETING_INPUT_SELECTOR));
}

function getInputAmount(input: HTMLInputElement) {
  const amount = Math.floor(Number(input.value));
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

function getSelectedMarketingInputs() {
  return getMarketingInputs().filter((input) => input.getAttribute(SELECTED_ATTRIBUTE) === "true");
}

function getSelectedMarketingTotal() {
  return getSelectedMarketingInputs().reduce((sum, input) => sum + getInputAmount(input), 0);
}

function setNativeInputValue(input: HTMLInputElement, value: number) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, String(value));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function getSaveButton(input: HTMLInputElement) {
  return input.parentElement?.querySelector<HTMLButtonElement>("button") ?? null;
}

function showBudgetWarning(message: string | null) {
  const existingWarning = document.getElementById(WARNING_ID);
  if (!message) {
    existingWarning?.remove();
    return;
  }

  const root = getMarketingRoot();
  if (!root) return;

  const warning = existingWarning ?? document.createElement("div");
  warning.id = WARNING_ID;
  warning.className =
    "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700";
  warning.textContent = message;

  if (!existingWarning) {
    root.insertBefore(warning, root.children[1] ?? null);
  }
}

function updateMarketingButtons() {
  const budget = getCurrentBudget();
  const total = getSelectedMarketingTotal();
  const overBudget = total > budget;

  getMarketingInputs().forEach((input) => {
    const button = getSaveButton(input);
    if (!button) return;

    button.disabled = input.disabled || overBudget;
    if (overBudget) {
      button.title = translateForLanguage(getStoredLanguage(), "error.marketingOverBudgetTitle");
    } else {
      button.removeAttribute("title");
    }
  });

  showBudgetWarning(
    overBudget
      ? translateForLanguage(getStoredLanguage(), "error.marketingOverBudget", {
          amount: formatMoney(total - budget),
        })
      : null,
  );
}

export function StudentJoinPageWithGuards() {
  useEffect(() => {
    let isClamping = false;

    function clampEditedInput(input: HTMLInputElement) {
      if (isClamping) return;
      const budget = getCurrentBudget();
      if (budget <= 0) return;

      input.setAttribute(SELECTED_ATTRIBUTE, "true");
      const selectedInputs = getSelectedMarketingInputs();
      const otherSelectedTotal = selectedInputs
        .filter((selectedInput) => selectedInput !== input)
        .reduce((sum, selectedInput) => sum + getInputAmount(selectedInput), 0);
      const maxForInput = Math.max(0, budget - otherSelectedTotal);
      const currentAmount = getInputAmount(input);

      if (currentAmount > maxForInput) {
        isClamping = true;
        setNativeInputValue(input, maxForInput);
        isClamping = false;
      }

      updateMarketingButtons();
    }

    function handleInput(event: Event) {
      const target = event.target;
      if (isClamping || !(target instanceof HTMLInputElement)) return;
      if (!target.matches(MARKETING_INPUT_SELECTOR)) return;

      window.setTimeout(() => clampEditedInput(target), 0);
    }

    function blockIfOverBudget(event?: Event) {
      const budget = getCurrentBudget();
      const total = getSelectedMarketingTotal();
      if (total <= budget) return false;

      const message = translateForLanguage(getStoredLanguage(), "error.marketingOverBudget", {
        amount: formatMoney(total - budget),
      });
      showBudgetWarning(message);
      updateMarketingButtons();
      event?.preventDefault();
      event?.stopPropagation();
      if (event && "stopImmediatePropagation" in event) {
        event.stopImmediatePropagation();
      }
      return true;
    }

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button");
      if (button?.getAttribute("data-marketing-save") !== "true") return;

      const input = button.parentElement?.querySelector<HTMLInputElement>(MARKETING_INPUT_SELECTOR);
      if (!input) return;

      input.setAttribute(SELECTED_ATTRIBUTE, "true");
      blockIfOverBudget(event);
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");

      if (url.includes("/marketing") && method.toUpperCase() === "POST" && blockIfOverBudget()) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              error: translateForLanguage(getStoredLanguage(), "error.marketingOverBudgetTitle"),
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          ),
        );
      }

      return originalFetch(input, init);
    }) as typeof window.fetch;

    document.addEventListener("input", handleInput, true);
    document.addEventListener("click", handleClick, true);

    const observer = new MutationObserver(updateMarketingButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.fetch = originalFetch;
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, []);

  return <StudentJoinPage />;
}
