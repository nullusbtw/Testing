const MACROS: Array<{ token: string; categoryRu: string }> = [
  { token: "!десерт", categoryRu: "Десерт" },
  { token: "!первое", categoryRu: "Первое" },
  { token: "!второе", categoryRu: "Второе" },
  { token: "!напиток", categoryRu: "Напиток" },
  { token: "!салат", categoryRu: "Салат" },
  { token: "!суп", categoryRu: "Суп" },
  { token: "!перекус", categoryRu: "Перекус" },
];

export function parseDishNameForFirstMacro(name: string): {
  macroCategoryRu: string | null;
  sanitizedName: string;
} {
  const lower = name.toLowerCase();

  let first: { index: number; token: string; categoryRu: string } | null = null;

  for (const m of MACROS) {
    const idx = lower.indexOf(m.token);
    if (idx === -1) continue;
    if (!first || idx < first.index) {
      first = { index: idx, token: m.token, categoryRu: m.categoryRu };
    }
  }

  if (!first) {
    return { macroCategoryRu: null, sanitizedName: name.trim() };
  }

  const sanitized = name.slice(0, first.index) + name.slice(first.index + first.token.length);
  return {
    macroCategoryRu: first.categoryRu,
    sanitizedName: sanitized.replace(/\s+/g, " ").trim(),
  };
}

