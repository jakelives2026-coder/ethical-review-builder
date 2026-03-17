/**
 * Primitives — Lightly extended shadcn/ui components
 *
 * These are enhanced versions of shadcn components with ERB-specific
 * defaults, validation, and styling. Never edit the raw shadcn components
 * in /ui/ — use these primitives instead.
 *
 * Architecture:
 * /ui/           — Raw shadcn components (immutable)
 * /primitives/   — Extended wrappers with ERB standards applied
 * /blocks/       — Product-level compositions
 */

export { FormInput } from "./FormInput";
export { FormSelect } from "./FormSelect";
export { AutocompleteField } from "./AutocompleteField";
