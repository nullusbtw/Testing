export declare function computeDishAllowedFlags(products: Array<{
    vegan: boolean;
    glutenFree: boolean;
    sugarFree: boolean;
}>): {
    vegan: boolean;
    glutenFree: boolean;
    sugarFree: boolean;
};
export declare function applyRequestedFlagsToAllowed(params: {
    allowed: {
        vegan: boolean;
        glutenFree: boolean;
        sugarFree: boolean;
    };
    requested: {
        vegan?: boolean;
        glutenFree?: boolean;
        sugarFree?: boolean;
    };
}): {
    vegan: boolean;
    glutenFree: boolean;
    sugarFree: boolean;
};
//# sourceMappingURL=dishFlags.d.ts.map