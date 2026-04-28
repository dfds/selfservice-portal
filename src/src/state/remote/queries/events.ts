import { createSsuQuery, createSsuMutation } from "../queryFactory";

export const useEventSignups = createSsuQuery({
  queryKey: ["eventsignups"],
  urlSegments: ["events/signups"],
  select: (data: any) => data.items || [],
});

export const useEvents = createSsuQuery({
  queryKey: ["events"],
  urlSegments: ["events"],
  select: (data: any) => data.events || [],
});

export const useFrontpageEvents = createSsuQuery({
  queryKey: ["frontpage-events"],
  urlSegments: ["events", "upcoming"],
  select: (data: any) => data || { upcomingEvents: [], latestHeldEvent: null },
});

export const useUpcomingEvents = useFrontpageEvents;

export const useRegisterEvent = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["events"],
  payload: (data) => data,
});

export const useDeleteEvent = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => ["events", data.eventId],
  payload: () => null,
});

export const useUpdateEvent = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => ["events", data.id],
  payload: (data) => data,
});