/**
 * Mobile UI Standards
 * 
 * This file contains utility functions and constants for maintaining
 * consistent mobile UI styling across the application.
 * 
 * Based on industry standard accessibility guidelines from Apple and Google.
 */

import { cn } from "./utils";

/**
 * Font size standards for mobile
 */
export const mobileFontSizes = {
  // Minimum 16px for body text
  body: "text-base",
  // 20-24px for headings
  heading: "text-xl md:text-2xl",
  // Subheadings (18-20px)
  subheading: "text-lg md:text-xl",
  // Minimum 14px for labels
  label: "text-sm",
  // 16-18px for buttons
  button: "text-base",
};

/**
 * Input field standards for mobile
 */
export const mobileInputSizes = {
  // Minimum 44px height
  height: "min-h-[44px]",
  // 12-16px horizontal padding
  padding: "px-4 py-3",
  // Text size inside input
  fontSize: "text-base",
};

/**
 * Button standards for mobile
 */
export const mobileButtonSizes = {
  // Minimum 44x44px tap target
  size: "min-h-[44px] min-w-[44px]",
  // Standard padding
  padding: "px-4 py-3",
  // Spacing between buttons
  spacing: "space-x-2 space-y-0",
  // Vertical spacing when buttons stack
  stackedSpacing: "space-y-3",
};

/**
 * Container and layout standards for mobile
 */
export const mobileLayoutSizes = {
  // Standard section spacing
  sectionSpacing: "mb-6",
  // Standard container padding
  containerPadding: "px-4 py-4",
  // Larger container padding
  largeContainerPadding: "px-4 py-6",
};

/**
 * Utility functions for applying mobile styles
 */

/**
 * Apply mobile-friendly text styles
 */
export function getMobileTextStyles(
  type: keyof typeof mobileFontSizes, 
  additionalClasses?: string
): string {
  return cn(mobileFontSizes[type], additionalClasses);
}

/**
 * Apply mobile-friendly input styles
 */
export function getMobileInputStyles(additionalClasses?: string): string {
  return cn(
    mobileInputSizes.height,
    mobileInputSizes.padding,
    mobileInputSizes.fontSize,
    additionalClasses
  );
}

/**
 * Apply mobile-friendly button styles
 */
export function getMobileButtonStyles(additionalClasses?: string): string {
  return cn(
    mobileButtonSizes.size,
    mobileButtonSizes.padding,
    mobileFontSizes.button,
    additionalClasses
  );
}

/**
 * Apply mobile-friendly button container styles
 * @param stacked Whether buttons should be stacked vertically
 */
export function getMobileButtonContainerStyles(stacked: boolean = false): string {
  return cn(
    "flex",
    stacked ? "flex-col" : "flex-row items-center",
    stacked ? mobileButtonSizes.stackedSpacing : mobileButtonSizes.spacing
  );
}