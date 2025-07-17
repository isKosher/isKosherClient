export const DASHBOARD_CONSTANTS = {
  MAX_VIEWPORT_HEIGHT: "calc(100vh-200px)",
  EDIT_SECTIONS: {
    DETAILS: "details",
    KOSHER: "kosher",
    SUPERVISORS: "supervisors",
    CERTIFICATES: "certificates",
    PHOTOS: "photos",
  } as const,
  TABS: {
    OVERVIEW: "overview",
    KOSHER: "kosher",
    SUPERVISORS: "supervisors",
    CERTIFICATES: "certificates",
    PHOTOS: "photos",
  } as const,
  COLORS: {
    PRIMARY: "text-[#1A365D]",
    SECONDARY: "text-[#2D4A6D]",
    SKY_50: "bg-sky-50",
    SKY_200: "border-sky-200",
    SKY_300: "text-sky-300",
    SKY_500: "border-sky-500",
  } as const,
  STYLES: {
    BUSINESS_CARD_SELECTED: "border-sky-500 shadow-md",
    BUSINESS_CARD_DEFAULT: "border-gray-300",
    BADGE_PRIMARY: "bg-sky-50 text-[#1A365D] border-sky-200",
  } as const,
} as const;

export type EditSection = (typeof DASHBOARD_CONSTANTS.EDIT_SECTIONS)[keyof typeof DASHBOARD_CONSTANTS.EDIT_SECTIONS];
export type TabValue = (typeof DASHBOARD_CONSTANTS.TABS)[keyof typeof DASHBOARD_CONSTANTS.TABS];
