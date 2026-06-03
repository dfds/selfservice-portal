export const MOBILE_SIDEBAR_OPEN_EVENT = "ssu:open-sidebar";

export function openMobileSidebar(): void {
  window.dispatchEvent(new CustomEvent(MOBILE_SIDEBAR_OPEN_EVENT));
}
