/**
 * One-time script to create Stripe products and prices for ERB plans.
 * Run with: npx tsx scripts/seed-stripe-products.ts
 * Outputs price IDs to paste into server/stripe-config.ts
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY not set");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });

async function ensureProduct(name: string, description: string): Promise<string> {
  const existing = await stripe.products.list({ active: true, limit: 100 });
  const found = existing.data.find((p) => p.name === name);
  if (found) {
    console.log(`  Product exists: ${found.id} (${name})`);
    return found.id;
  }
  const product = await stripe.products.create({ name, description });
  console.log(`  Product created: ${product.id} (${name})`);
  return product.id;
}

async function ensurePrice(
  productId: string,
  unitAmount: number,
  nickname: string
): Promise<string> {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const found = existing.data.find(
    (p) => p.unit_amount === unitAmount && p.recurring?.interval === "month"
  );
  if (found) {
    console.log(`  Price exists: ${found.id} ($${unitAmount / 100}/month)`);
    return found.id;
  }
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: "usd",
    recurring: { interval: "month" },
    nickname,
  });
  console.log(`  Price created: ${price.id} ($${unitAmount / 100}/month)`);
  return price.id;
}

async function main() {
  console.log("Seeding Stripe products and prices...\n");

  console.log("Pro plan:");
  const proProductId = await ensureProduct(
    "Ethical Review Builder — Pro",
    "Unlimited reviews, 5 business profiles, all templates, priority support"
  );
  const proPriceId = await ensurePrice(proProductId, 2900, "Pro Monthly");

  console.log("\nBusiness plan:");
  const businessProductId = await ensureProduct(
    "Ethical Review Builder — Business",
    "Everything in Pro plus white-label, team seats, and API access"
  );
  const businessPriceId = await ensurePrice(businessProductId, 9900, "Business Monthly");

  console.log("\n✅ Done. Add these to server/stripe-config.ts:\n");
  console.log(`export const STRIPE_PRO_PRICE_ID = "${proPriceId}";`);
  console.log(`export const STRIPE_BUSINESS_PRICE_ID = "${businessPriceId}";`);
  console.log(`export const STRIPE_PRO_PRODUCT_ID = "${proProductId}";`);
  console.log(`export const STRIPE_BUSINESS_PRODUCT_ID = "${businessProductId}";`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
