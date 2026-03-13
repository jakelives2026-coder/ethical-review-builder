/**
 * Stripe product and price IDs for Ethical Review Builder plans.
 * Products and prices were seeded via scripts/seed-stripe-products.ts.
 * These IDs are for the TEST mode Stripe account.
 * When switching to live mode, re-run the seed script with live keys
 * and update these constants.
 */

export const STRIPE_PRO_PRICE_ID = "price_1TAZ2UEHxeRLQl8dr3mDcGHd";
export const STRIPE_BUSINESS_PRICE_ID = "price_1TAZ2VEHxeRLQl8dQ1bndRX0";
export const STRIPE_PRO_PRODUCT_ID = "prod_U8qjOseAE6AFeW";
export const STRIPE_BUSINESS_PRODUCT_ID = "prod_U8qja8Z35cE6sb";

export const PLAN_PRICE_MAP: Record<string, string> = {
  pro: STRIPE_PRO_PRICE_ID,
  business: STRIPE_BUSINESS_PRICE_ID,
};

export const PRICE_PLAN_MAP: Record<string, string> = {
  [STRIPE_PRO_PRICE_ID]: "pro",
  [STRIPE_BUSINESS_PRICE_ID]: "business",
};
