/**
 * Common ISO country codes → display names, for the dashboard's
 * Countries widget. Not exhaustive — an unmapped code just shows as
 * itself (still useful, just less pretty) rather than pulling in a
 * full country-name dependency for a handful of rows.
 */
const COUNTRY_NAMES = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  SG: "Singapore",
  CA: "Canada",
  AU: "Australia",
  FR: "France",
  NL: "Netherlands",
  JP: "Japan",
  BR: "Brazil",
  AE: "United Arab Emirates",
};

/** @param {string} code ISO 3166-1 alpha-2, e.g. "IN" */
export function countryName(code) {
  if (!code) return "Unknown";
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}
