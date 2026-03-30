"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dishMacros_1 = require("../src/lib/dishMacros");
describe("parseDishNameForFirstMacro", () => {
    it("uses the first macro occurrence and removes it", () => {
        const { macroCategoryRu, sanitizedName } = (0, dishMacros_1.parseDishNameForFirstMacro)("Очень !суп суп и !десерт торт");
        expect(macroCategoryRu).toBe("Суп");
        expect(sanitizedName).toBe("Очень суп и !десерт торт");
    });
});
//# sourceMappingURL=dishMacros.test.js.map