import { applyRequestedFlagsToAllowed, computeDishAllowedFlags } from "../src/lib/dishFlags";

describe("dish flags rules", () => {
  it("allows flags only when all products have them", () => {
    const allowed = computeDishAllowedFlags([
      { vegan: true, glutenFree: true, sugarFree: true },
      { vegan: true, glutenFree: false, sugarFree: true },
    ]);

    expect(allowed.vegan).toBe(true);
    expect(allowed.glutenFree).toBe(false);
    expect(allowed.sugarFree).toBe(true);

    const effective = applyRequestedFlagsToAllowed({
      allowed,
      requested: { vegan: true, glutenFree: true, sugarFree: true },
    });

    expect(effective).toEqual({ vegan: true, glutenFree: false, sugarFree: true });
  });
});

