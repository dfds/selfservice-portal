import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { queryClient } from "@/state/remote/client";
import {
  useMe,
  useUpdateUserSettingsInformation,
} from "@/state/remote/queries/me";
import { useToast } from "@/context/ToastContext";
import { checkIfCloudEngineer } from "@/lib/roleUtils";
import AppContext from "@/AppContext";
import { useRybbit } from "@/RybbitContext";
import { useDriverTour } from "./useDriverTour";
import { getTours, LATEST_TOUR_ID } from "./registry";
import type { TourDefinition, TourState } from "./types";
import { EMPTY_TOUR_STATE } from "./types";
import { useReleaseNotes } from "@/state/remote/queries/releaseNotes";

const LOCAL_STORAGE_KEY = "ssu-whatsnew-state";

interface WhatsNewContextValue {
  tours: TourDefinition[];
  unseenCount: number;
  hasUnseenLatest: boolean;
  hasUnseenReleaseNotes: boolean;
  isListOpen: boolean;
  openList: () => void;
  closeList: () => void;
  startTour: (id: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  isCompleted: (id: string) => boolean;
}

const WhatsNewContext = createContext<WhatsNewContextValue | null>(null);

function readLocalState(): TourState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return EMPTY_TOUR_STATE;
    const parsed = JSON.parse(raw);
    return {
      seenIds: Array.isArray(parsed.seenIds) ? parsed.seenIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds)
        ? parsed.dismissedIds
        : [],
      completedIds: Array.isArray(parsed.completedIds)
        ? parsed.completedIds
        : [],
      seenReleaseNoteIds: Array.isArray(parsed.seenReleaseNoteIds)
        ? parsed.seenReleaseNoteIds
        : [],
    };
  } catch {
    return EMPTY_TOUR_STATE;
  }
}

function writeLocalState(state: TourState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode); silently no-op.
  }
}

function uniq(list: string[]): string[] {
  return Array.from(new Set(list));
}

export function WhatsNewProvider({ children }: { children: ReactNode }) {
  const { data: me } = useMe();
  const { user } = useContext(AppContext) as any;
  const { mutate: updateUserSettings } = useUpdateUserSettingsInformation();
  const toast = useToast();
  const driveTour = useDriverTour();
  const rybbit = useRybbit();

  const isCloudEngineer = useMemo(
    () => checkIfCloudEngineer(user?.roles ?? []),
    [user?.roles],
  );

  const tours = useMemo(() => getTours({ isCloudEngineer }), [isCloudEngineer]);

  const [state, setState] = useState<TourState>(() => readLocalState());
  const [isListOpen, setIsListOpen] = useState(false);

  // Hydrate from server when /me resolves; server is authoritative.
  useEffect(() => {
    const settings = (me as any)?.personalInformation?.userSettings;
    if (!settings) return;
    const next: TourState = {
      seenIds: settings.seenWhatsNewIds ?? [],
      dismissedIds: settings.dismissedWhatsNewIds ?? [],
      completedIds: settings.completedWhatsNewIds ?? [],
      seenReleaseNoteIds: settings.seenReleaseNoteIds ?? [],
    };
    setState(next);
    writeLocalState(next);
  }, [me]);

  const persist = useCallback(
    (next: TourState) => {
      setState(next);
      writeLocalState(next);
      const settings = (me as any)?.personalInformation?.userSettings;
      // Merge with whatever else is on UserSettings — POST overwrites the blob.
      const payload = {
        ...(settings ?? {}),
        seenWhatsNewIds: next.seenIds,
        dismissedWhatsNewIds: next.dismissedIds,
        completedWhatsNewIds: next.completedIds,
        seenReleaseNoteIds: next.seenReleaseNoteIds,
      };
      updateUserSettings(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["me"] });
        },
        onError: () => {
          toast.error("Could not save What's New preferences.");
        },
      });
    },
    [me, updateUserSettings, toast],
  );

  const unseenTours = useMemo(
    () =>
      tours.filter(
        (t) =>
          !state.seenIds.includes(t.id) && !state.dismissedIds.includes(t.id),
      ),
    [tours, state.seenIds, state.dismissedIds],
  );

  const hasUnseenLatest =
    !!LATEST_TOUR_ID &&
    !state.seenIds.includes(LATEST_TOUR_ID) &&
    !state.dismissedIds.includes(LATEST_TOUR_ID);

  // Mirrors the "top 3 active by releaseDate desc" rule in WhatsNewListModal —
  // keep the two in sync.
  const { data: releaseNotesData } = useReleaseNotes({});
  const recentReleaseNoteIds = useMemo<string[]>(() => {
    const items: any[] = (releaseNotesData as any)?.items ?? [];
    return items
      .filter((n) => n.isActive === true)
      .sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      )
      .slice(0, 3)
      .map((n) => n.id);
  }, [releaseNotesData]);

  const unseenReleaseNoteIds = useMemo(
    () =>
      recentReleaseNoteIds.filter(
        (id) => !state.seenReleaseNoteIds.includes(id),
      ),
    [recentReleaseNoteIds, state.seenReleaseNoteIds],
  );

  const hasUnseenReleaseNotes = unseenReleaseNoteIds.length > 0;

  const openList = useCallback(() => {
    setIsListOpen(true);
    rybbit.trackEvent?.("whatsnew:list:open", {});
    const hasNewTours = unseenTours.length > 0;
    const hasNewNotes = unseenReleaseNoteIds.length > 0;
    if (!hasNewTours && !hasNewNotes) return;
    const next: TourState = {
      ...state,
      seenIds: hasNewTours
        ? uniq([...state.seenIds, ...unseenTours.map((t) => t.id)])
        : state.seenIds,
      seenReleaseNoteIds: hasNewNotes
        ? uniq([...state.seenReleaseNoteIds, ...unseenReleaseNoteIds])
        : state.seenReleaseNoteIds,
    };
    persist(next);
  }, [persist, rybbit, state, unseenTours, unseenReleaseNoteIds]);

  const closeList = useCallback(() => setIsListOpen(false), []);

  const markCompleted = useCallback(
    (id: string) => {
      const next: TourState = {
        ...state,
        seenIds: uniq([...state.seenIds, id]),
        completedIds: uniq([...state.completedIds, id]),
      };
      persist(next);
      rybbit.trackEvent?.("whatsnew:tour:complete", { tourId: id });
    },
    [persist, rybbit, state],
  );

  const startTour = useCallback(
    (id: string) => {
      const tour = tours.find((t) => t.id === id);
      if (!tour) return;
      rybbit.trackEvent?.("whatsnew:tour:start", { tourId: id });
      setIsListOpen(false);
      driveTour(tour, () => markCompleted(id));
    },
    [driveTour, markCompleted, rybbit, tours],
  );

  const dismiss = useCallback(
    (id: string) => {
      const next: TourState = {
        ...state,
        seenIds: uniq([...state.seenIds, id]),
        dismissedIds: uniq([...state.dismissedIds, id]),
      };
      persist(next);
      rybbit.trackEvent?.("whatsnew:tour:dismiss", { tourId: id });
    },
    [persist, rybbit, state],
  );

  const dismissAll = useCallback(() => {
    const allIds = tours.map((t) => t.id);
    const next: TourState = {
      ...state,
      seenIds: uniq([...state.seenIds, ...allIds]),
      dismissedIds: uniq([...state.dismissedIds, ...allIds]),
    };
    persist(next);
    rybbit.trackEvent?.("whatsnew:list:dismiss-all", {});
  }, [persist, rybbit, state, tours]);

  const isCompleted = useCallback(
    (id: string) => state.completedIds.includes(id),
    [state.completedIds],
  );

  const value: WhatsNewContextValue = {
    tours,
    unseenCount: unseenTours.length,
    hasUnseenLatest,
    hasUnseenReleaseNotes,
    isListOpen,
    openList,
    closeList,
    startTour,
    dismiss,
    dismissAll,
    isCompleted,
  };

  return (
    <WhatsNewContext.Provider value={value}>
      {children}
    </WhatsNewContext.Provider>
  );
}

export function useWhatsNew(): WhatsNewContextValue {
  const ctx = useContext(WhatsNewContext);
  if (!ctx) {
    throw new Error("useWhatsNew must be used within WhatsNewProvider");
  }
  return ctx;
}
