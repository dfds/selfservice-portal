import type { TourDefinition } from "../types";

export const tour_2026_q2_customisation: TourDefinition = {
  id: "2026-q2-customisation7",
  release: "2026-Q2",
  releaseDate: "2026-06-15",
  title: "Make the portal yours",
  summary:
    "Pick a colour theme and resize the whole UI to taste — your choices follow you across sessions and devices.",
  category: "ui",
  steps: [
    {
      target: '[data-tour="theme-toggle"]',
      title: "Pick a colour theme",
      body: "Switch between Light, Dark, and Auto. Auto follows your operating system, so the portal flips with it.",
      position: "right",
      inSidebar: true,
    },
    {
      target: '[data-tour="user-menu-trigger"]',
      title: "Your personal settings live here",
      body: "Open your profile menu to find UI scaling and session controls.",
      position: "right",
      inSidebar: true,
    },
    {
      target: '[data-tour="ui-size-section"]',
      title: "Resize the whole UI",
      body: "Pick a preset or type a custom percentage. The choice applies everywhere and is remembered next time you sign in.",
      position: "right",
      inSidebar: true,
      onEnter: () => {
        if (document.querySelector('[data-tour="ui-size-section"]')) return;
        const trigger = document.querySelector<HTMLButtonElement>(
          '[data-tour="user-menu-trigger"]',
        );
        trigger?.click();
      },
    },
  ],
};

export const tour_2026_q2_topbar: TourDefinition = {
  id: "2026-q2-whats-new-introduction",
  release: "2026-Q2",
  releaseDate: "2026-06-01",
  title: "Introducing what is new",
  summary:
    "A new spot in the top bar surfaces recent changes and offers guided walkthroughs whenever the portal evolves.",
  category: "ui",
  steps: [
    {
      target: '[data-tour="whats-new-bell"]',
      title: "What's New lives here",
      body: "Click the sparkle any time to see recent changes and take a guided tour. A small dot appears when there is something new to look at.",
      position: "bottom",
    },
    {
      target: '[data-tour="nav-capabilities"]',
      title: "Capabilities — refreshed",
      body: "The capabilities list now shares the new design system: faster filtering, denser tables, and a mobile-friendly card view.",
      route: "/capabilities",
      position: "right",
    },
  ],
};
