"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dishFlags_1 = require("../src/lib/dishFlags");
describe("dish flags rules", () => {
    it("allows flags only when all products have them", () => {
        const allowed = (0, dishFlags_1.computeDishAllowedFlags)([
            { vegan: true, glutenFree: true, sugarFree: true },
            { vegan: true, glutenFree: false, sugarFree: true },
        ]);
        expect(allowed.vegan).toBe(true);
        expect(allowed.glutenFree).toBe(false);
        expect(allowed.sugarFree).toBe(true);
        const effective = (0, dishFlags_1.applyRequestedFlagsToAllowed)({
            allowed,
            requested: { vegan: true, glutenFree: true, sugarFree: true },
        });
        expect(effective).toEqual({ vegan: true, glutenFree: false, sugarFree: true });
    });
});
//# sourceMappingURL=dishFlags.test.js.map