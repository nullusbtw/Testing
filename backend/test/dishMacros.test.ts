import { parseDishNameForFirstMacro } from "../src/lib/dishMacros";

describe("parseDishNameForFirstMacro", () => {
  it("uses the first macro occurrence and removes it", () => {
    const { macroCategoryRu, sanitizedName } = parseDishNameForFirstMacro("Очень !суп суп и !десерт торт");
    expect(macroCategoryRu).toBe("Суп");
    expect(sanitizedName).toBe("Очень суп и !десерт торт");
  });
});

