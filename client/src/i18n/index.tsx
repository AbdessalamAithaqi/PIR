/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "en" | "fr";

export const LANGUAGE_STORAGE_KEY = "pir-ui-language";

const englishTranslations = {
  "language.aria": "Select language",

  "app.title": "The Gainline",
  "app.teacherLogin": "Teacher Login",
  "app.studentLogin": "Student Login",

  "common.back": "Back",
  "common.save": "Save",
  "common.saving": "Saving...",
  "common.dismiss": "Dismiss",
  "common.actionNeeded": "Action needed",
  "common.budget": "Budget",
  "common.fans": "Fans",
  "common.team": "Team",
  "common.teams": "Teams",
  "common.students": "Students",
  "common.assigned": "Assigned",
  "common.matches": "Matches",
  "common.leaderboard": "Leaderboard",
  "common.report": "Report",
  "common.reports": "Reports",
  "common.round": "Round",
  "common.open": "Open",
  "common.locked": "Locked",
  "common.pending": "Pending",
  "common.place": "Place",
  "common.money": "Money",
  "common.result": "Result",
  "common.growth": "Growth",
  "common.events": "Events",
  "common.form": "Form",
  "common.currentState": "Current state: {status}",
  "common.roundOf": "Round {round} / 6",
  "common.roundNumber": "Round {round}",
  "common.teamsCount": "{count} teams",
  "common.membersCount": "{count} members",
  "common.fansCount": "{count} fans",
  "common.status.CREATED": "Created",
  "common.status.ACTIVE": "Active",
  "common.status.PAUSED": "Paused",
  "common.status.FINISHED": "Finished",

  "teacherDashboard.badge": "Teacher console",
  "teacherDashboard.title": "Game management",
  "teacherDashboard.description": "Create leagues and share join codes with students.",
  "teacherDashboard.create": "Create game",
  "teacherDashboard.creating": "Creating...",
  "teacherDashboard.existingGames": "Existing games",
  "teacherDashboard.empty": "No games created yet.",
  "teacherDashboard.loading": "Loading games...",
  "teacherDashboard.gameMeta": "Round {round} - {status} - {teams} teams",
  "teacherDashboard.deleteGame": "Delete game",
  "teacherDashboard.deleteConfirm": "Are you sure you want to delete this game and all associated data?",
  "teacherDashboard.defaultGameName": "Game {number}",

  "teacherGame.loading": "Loading game...",
  "teacherGame.notFound": "Game not found",
  "teacherGame.management": "Teacher management",
  "teacherGame.tabs.teams": "Teams",
  "teacherGame.tabs.parameters": "Parameters",
  "teacherGame.tabs.round": "Round Management",
  "teacherGame.tabs.report": "Reports",
  "teacherGame.tabs.leaderboard": "Leaderboard",
  "teacherGame.joinedStudents": "Joined students",
  "teacherGame.noStudents": "No students yet",
  "teacherGame.unassigned": "Unassigned",
  "teacherGame.dropStudents": "Drop students here",
  "teacherGame.parameters.title": "Game parameters",
  "teacherGame.parameters.description": "Tune global simulation variables.",
  "teacherGame.parameters.injuryChance": "Injury chance",
  "teacherGame.parameters.fanGain": "Fan gain",
  "teacherGame.parameters.financialGrowth": "Financial growth",
  "teacherGame.parameters.luckFactor": "Luck factor",
  "teacherGame.round.launch": "Launch",
  "teacherGame.round.next": "Move to next round",
  "teacherGame.round.stop": "Stop",
  "teacherGame.round.readyTeams": "Ready teams {ready} / {total}",
  "teacherGame.report.roundsPlayed": "Rounds played",

  "student.tabs.team": "Team",
  "student.tabs.draft": "Player Draft",
  "student.tabs.marketing": "Marketing",
  "student.tabs.leaderboard": "Leaderboard",
  "student.tabs.report": "Report",
  "student.join.badge": "Student access",
  "student.join.title": "Join a game",
  "student.join.description": "Enter the class code shared by your professor.",
  "student.join.classCode": "Class code",
  "student.join.submit": "Join game",
  "student.join.submitting": "Joining...",
  "student.waiting.title": "Waiting for team assignment",
  "student.waiting.description": "You joined {gameName}. Keep this page open while the professor places you in a team.",
  "student.leaveGame": "Leave game",
  "student.decisionOpen": "Decision open",
  "student.squad.title": "Squad",
  "student.squad.instructions": "Select a starter, then choose a bench player.",
  "student.squad.locked": "The professor has locked decisions.",
  "student.squad.readySubmitted": "Ready submitted",
  "student.squad.markReady": "Mark ready",
  "student.squad.starting": "Starting XV",
  "student.squad.bench": "Bench ({count})",
  "student.draft.title": "Player Draft",
  "student.draft.description": "Reserve budget by placing bids on available players.",
  "student.draft.locked": "Player draft decisions are locked.",
  "student.draft.reserved": "Reserved {amount}",
  "student.draft.refresh": "Refresh draft",
  "student.draft.refreshing": "Refreshing...",
  "student.draft.ovr": "OVR",
  "student.draft.start": "Start {amount}",
  "student.draft.highBid": "Current high bid {amount}",
  "student.draft.bid": "Bid",
  "student.draft.emptyOpen": "No draft players are available yet. Refresh the draft or ask the professor to relaunch the round.",
  "student.draft.emptyClosed": "The player draft opens when the professor launches a round.",
  "student.marketing.title": "Marketing",
  "student.marketing.description": "Publicity choices affect fan growth. Merchandise choices affect revenue.",
  "student.marketing.planned": "Planned {planned} / {budget}",
  "student.marketing.category.publicity": "Publicity",
  "student.marketing.category.merchandise": "Merchandise",
  "student.marketing.campus.name": "Campus campaign",
  "student.marketing.campus.impact": "Fan-growth marketing for this round.",
  "student.marketing.social.name": "Social media push",
  "student.marketing.social.impact": "Fan-growth marketing for this round.",
  "student.marketing.merch.name": "Merch stand",
  "student.marketing.merch.impact": "Revenue marketing for this round.",
  "student.marketing.sponsor.name": "Local sponsor event",
  "student.marketing.sponsor.impact": "Revenue marketing for this round.",
  "student.marketing.family.name": "Family match day",
  "student.marketing.family.impact": "Revenue marketing for this round.",
  "student.leaderboard.seasonTable": "Season table",
  "student.report.description": "Historical performance snapshot.",

  "error.joinCodeRequired": "Enter a class code to join.",
  "error.joinFailed": "Unable to join this game.",
  "error.roundClosed": "Round is not open.",
  "error.positiveBid": "Enter a positive bid amount.",
  "error.placeBid": "Unable to place bid",
  "error.saveMarketing": "Unable to save marketing",
  "error.markReady": "Unable to mark ready",
  "error.loadGame": "Failed to load game",
  "error.loadGames": "Failed to load games",
  "error.createGame": "Failed to create game",
  "error.deleteGame": "Failed to delete game",
  "error.assignStudent": "Failed to assign student",
  "error.unassignStudent": "Failed to unassign student",
  "error.updateRound": "Failed to update round",
  "error.saveParameters": "Failed to save parameters",
  "error.marketingOverBudgetTitle": "Marketing plan exceeds team budget",
  "error.marketingOverBudget": "Marketing plan exceeds your budget by {amount}.",
} as const;

export type TranslationKey = keyof typeof englishTranslations;

const frenchTranslations: Record<TranslationKey, string> = {
  "language.aria": "Choisir la langue",

  "app.title": "The Gainline",
  "app.teacherLogin": "Connexion professeur",
  "app.studentLogin": "Connexion étudiant",

  "common.back": "Retour",
  "common.save": "Enregistrer",
  "common.saving": "Enregistrement...",
  "common.dismiss": "Fermer",
  "common.actionNeeded": "Action requise",
  "common.budget": "Budget",
  "common.fans": "Supporters",
  "common.team": "Équipe",
  "common.teams": "Équipes",
  "common.students": "Étudiants",
  "common.assigned": "Affectés",
  "common.matches": "Matchs",
  "common.leaderboard": "Classement",
  "common.report": "Rapport",
  "common.reports": "Rapports",
  "common.round": "Tour",
  "common.open": "Ouvert",
  "common.locked": "Verrouillé",
  "common.pending": "En attente",
  "common.place": "Place",
  "common.money": "Argent",
  "common.result": "Résultat",
  "common.growth": "Croissance",
  "common.events": "Événements",
  "common.form": "Forme",
  "common.currentState": "État actuel : {status}",
  "common.roundOf": "Tour {round} / 6",
  "common.roundNumber": "Tour {round}",
  "common.teamsCount": "{count} équipes",
  "common.membersCount": "{count} membres",
  "common.fansCount": "{count} supporters",
  "common.status.CREATED": "Créé",
  "common.status.ACTIVE": "Actif",
  "common.status.PAUSED": "En pause",
  "common.status.FINISHED": "Terminé",

  "teacherDashboard.badge": "Console professeur",
  "teacherDashboard.title": "Gestion des parties",
  "teacherDashboard.description": "Créez des ligues et partagez les codes d'accès avec les étudiants.",
  "teacherDashboard.create": "Créer une partie",
  "teacherDashboard.creating": "Création...",
  "teacherDashboard.existingGames": "Parties existantes",
  "teacherDashboard.empty": "Aucune partie créée pour le moment.",
  "teacherDashboard.loading": "Chargement des parties...",
  "teacherDashboard.gameMeta": "Tour {round} - {status} - {teams} équipes",
  "teacherDashboard.deleteGame": "Supprimer la partie",
  "teacherDashboard.deleteConfirm": "Voulez-vous vraiment supprimer cette partie et toutes ses données ?",
  "teacherDashboard.defaultGameName": "Partie {number}",

  "teacherGame.loading": "Chargement de la partie...",
  "teacherGame.notFound": "Partie introuvable",
  "teacherGame.management": "Gestion professeur",
  "teacherGame.tabs.teams": "Équipes",
  "teacherGame.tabs.parameters": "Paramètres",
  "teacherGame.tabs.round": "Gestion du tour",
  "teacherGame.tabs.report": "Rapports",
  "teacherGame.tabs.leaderboard": "Classement",
  "teacherGame.joinedStudents": "Étudiants inscrits",
  "teacherGame.noStudents": "Aucun étudiant pour le moment",
  "teacherGame.unassigned": "Non affecté",
  "teacherGame.dropStudents": "Déposez les étudiants ici",
  "teacherGame.parameters.title": "Paramètres de la partie",
  "teacherGame.parameters.description": "Ajustez les variables globales de simulation.",
  "teacherGame.parameters.injuryChance": "Risque de blessure",
  "teacherGame.parameters.fanGain": "Gain de supporters",
  "teacherGame.parameters.financialGrowth": "Croissance financière",
  "teacherGame.parameters.luckFactor": "Facteur chance",
  "teacherGame.round.launch": "Lancer",
  "teacherGame.round.next": "Passer au tour suivant",
  "teacherGame.round.stop": "Arrêter",
  "teacherGame.round.readyTeams": "Équipes prêtes {ready} / {total}",
  "teacherGame.report.roundsPlayed": "Tours joués",

  "student.tabs.team": "Équipe",
  "student.tabs.draft": "Draft joueurs",
  "student.tabs.marketing": "Marketing",
  "student.tabs.leaderboard": "Classement",
  "student.tabs.report": "Rapport",
  "student.join.badge": "Accès étudiant",
  "student.join.title": "Rejoindre une partie",
  "student.join.description": "Entrez le code de classe partagé par votre professeur.",
  "student.join.classCode": "Code de classe",
  "student.join.submit": "Rejoindre la partie",
  "student.join.submitting": "Connexion...",
  "student.waiting.title": "En attente d'affectation",
  "student.waiting.description": "Vous avez rejoint {gameName}. Gardez cette page ouverte pendant que le professeur vous place dans une équipe.",
  "student.leaveGame": "Quitter la partie",
  "student.decisionOpen": "Décision ouverte",
  "student.squad.title": "Effectif",
  "student.squad.instructions": "Sélectionnez un titulaire, puis choisissez un remplaçant.",
  "student.squad.locked": "Le professeur a verrouillé les décisions.",
  "student.squad.readySubmitted": "Prêt envoyé",
  "student.squad.markReady": "Marquer prêt",
  "student.squad.starting": "XV de départ",
  "student.squad.bench": "Remplaçants ({count})",
  "student.draft.title": "Draft joueurs",
  "student.draft.description": "Réservez du budget en plaçant des offres sur les joueurs disponibles.",
  "student.draft.locked": "Les décisions de draft sont verrouillées.",
  "student.draft.reserved": "Réservé {amount}",
  "student.draft.refresh": "Actualiser la draft",
  "student.draft.refreshing": "Actualisation...",
  "student.draft.ovr": "GEN",
  "student.draft.start": "Départ {amount}",
  "student.draft.highBid": "Meilleure offre actuelle {amount}",
  "student.draft.bid": "Offrir",
  "student.draft.emptyOpen": "Aucun joueur de draft n'est disponible pour le moment. Actualisez la draft ou demandez au professeur de relancer le tour.",
  "student.draft.emptyClosed": "La draft joueurs s'ouvre quand le professeur lance un tour.",
  "student.marketing.title": "Marketing",
  "student.marketing.description": "La publicité influence la croissance des supporters. Le merchandising influence les revenus.",
  "student.marketing.planned": "Prévu {planned} / {budget}",
  "student.marketing.category.publicity": "Publicité",
  "student.marketing.category.merchandise": "Merchandising",
  "student.marketing.campus.name": "Campagne campus",
  "student.marketing.campus.impact": "Marketing de croissance des supporters pour ce tour.",
  "student.marketing.social.name": "Poussée réseaux sociaux",
  "student.marketing.social.impact": "Marketing de croissance des supporters pour ce tour.",
  "student.marketing.merch.name": "Stand merchandising",
  "student.marketing.merch.impact": "Marketing de revenus pour ce tour.",
  "student.marketing.sponsor.name": "Événement sponsor local",
  "student.marketing.sponsor.impact": "Marketing de revenus pour ce tour.",
  "student.marketing.family.name": "Journée famille",
  "student.marketing.family.impact": "Marketing de revenus pour ce tour.",
  "student.leaderboard.seasonTable": "Tableau de saison",
  "student.report.description": "Instantané des performances historiques.",

  "error.joinCodeRequired": "Entrez un code de classe.",
  "error.joinFailed": "Impossible de rejoindre cette partie.",
  "error.roundClosed": "Le tour n'est pas ouvert.",
  "error.positiveBid": "Entrez un montant d'offre positif.",
  "error.placeBid": "Impossible de placer l'offre",
  "error.saveMarketing": "Impossible d'enregistrer le marketing",
  "error.markReady": "Impossible de marquer prêt",
  "error.loadGame": "Impossible de charger la partie",
  "error.loadGames": "Impossible de charger les parties",
  "error.createGame": "Impossible de créer la partie",
  "error.deleteGame": "Impossible de supprimer la partie",
  "error.assignStudent": "Impossible d'affecter l'étudiant",
  "error.unassignStudent": "Impossible de retirer l'affectation",
  "error.updateRound": "Impossible de mettre à jour le tour",
  "error.saveParameters": "Impossible d'enregistrer les paramètres",
  "error.marketingOverBudgetTitle": "Le plan marketing dépasse le budget de l'équipe",
  "error.marketingOverBudget": "Le plan marketing dépasse votre budget de {amount}.",
};

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: englishTranslations,
  fr: frenchTranslations,
};

type TranslationValues = Record<string, string | number>;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "fr" ? "fr" : "en";
}

export function translateForLanguage(
  language: Language,
  key: TranslationKey,
  values: TranslationValues = {},
) {
  const template = translations[language][key] ?? translations.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

export function formatStatus(status: string, t: I18nContextValue["t"]) {
  const key = `common.status.${status}` as TranslationKey;
  return Object.prototype.hasOwnProperty.call(englishTranslations, key) ? t(key) : status;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => translateForLanguage(language, key, values),
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className={className}>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value === "fr" ? "fr" : "en")}
        aria-label={t("language.aria")}
        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <option value="en">En</option>
        <option value="fr">Fr</option>
      </select>
    </label>
  );
}
