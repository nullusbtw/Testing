"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDishAllowedFlags = computeDishAllowedFlags;
exports.applyRequestedFlagsToAllowed = applyRequestedFlagsToAllowed;
function computeDishAllowedFlags(products) {
    const all = products.length > 0;
    const vegan = all && products.every((p) => p.vegan);
    const glutenFree = all && products.every((p) => p.glutenFree);
    const sugarFree = all && products.every((p) => p.sugarFree);
    return { vegan, glutenFree, sugarFree };
}
function applyRequestedFlagsToAllowed(params) {
    const { allowed, requested } = params;
    return {
        vegan: Boolean(requested.vegan) && allowed.vegan,
        glutenFree: Boolean(requested.glutenFree) && allowed.glutenFree,
        sugarFree: Boolean(requested.sugarFree) && allowed.sugarFree,
    };
}
//# sourceMappingURL=dishFlags.js.map