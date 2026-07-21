export const LEGAL_DOMAINS = [
  "Constitutional and treaty framework",
  "Health governance and sanitary authority",
  "Public administration",
  "Planning, budget and public finance",
  "Borders, migration, ports, airports and customs",
  "Data, transparency and rights safeguards",
  "Oversight and accountability",
  "Research, laboratories and health products",
  "Standards and technical regulation",
  "Other / requires classification"
] as const;

export type LegalDomain = typeof LEGAL_DOMAINS[number];

export function getLegalDomain(sector: string = "", subsector: string = ""): LegalDomain {
  const combined = (sector + " " + subsector).toLowerCase();

  if (combined.includes("constitutional") || combined.includes("treaty") || combined.includes("international law")) {
    return "Constitutional and treaty framework";
  }
  if (combined.includes("health governance") || combined.includes("sanitary authority") || combined.includes("public health") || combined.includes("health services")) {
    return "Health governance and sanitary authority";
  }
  if (combined.includes("public administration") || combined.includes("administrative law")) {
    return "Public administration";
  }
  if (combined.includes("planning") || combined.includes("budget") || combined.includes("finance") || combined.includes("fiscal")) {
    return "Planning, budget and public finance";
  }
  if (combined.includes("border") || combined.includes("migration") || combined.includes("port") || combined.includes("airport") || combined.includes("customs") || combined.includes("aduanera")) {
    return "Borders, migration, ports, airports and customs";
  }
  if (combined.includes("data") || combined.includes("transparency") || combined.includes("rights") || combined.includes("privacy") || combined.includes("access to information")) {
    return "Data, transparency and rights safeguards";
  }
  if (combined.includes("oversight") || combined.includes("accountability") || combined.includes("audit") || combined.includes("responsibilities")) {
    return "Oversight and accountability";
  }
  if (combined.includes("research") || combined.includes("laboratory") || combined.includes("health products") || combined.includes("pharmaceutical") || combined.includes("science")) {
    return "Research, laboratories and health products";
  }
  if (combined.includes("standards") || combined.includes("technical regulation") || combined.includes("quality infrastructure") || combined.includes("normatividad")) {
    return "Standards and technical regulation";
  }

  // Specific mappings for the Mexico pilot data if needed
  if (combined.includes("health")) return "Health governance and sanitary authority";

  return "Other / requires classification";
}
