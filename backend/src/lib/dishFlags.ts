export function computeDishAllowedFlags(products: Array<{ vegan: boolean; glutenFree: boolean; sugarFree: boolean }>) {
  const all = products.length > 0;
  const vegan = all && products.every((p) => p.vegan);
  const glutenFree = all && products.every((p) => p.glutenFree);
  const sugarFree = all && products.every((p) => p.sugarFree);

  return { vegan, glutenFree, sugarFree };
}

export function applyRequestedFlagsToAllowed(params: {
  allowed: { vegan: boolean; glutenFree: boolean; sugarFree: boolean };
  requested: { vegan?: boolean; glutenFree?: boolean; sugarFree?: boolean };
}) {
  const { allowed, requested } = params;
  return {
    vegan: Boolean(requested.vegan) && allowed.vegan,
    glutenFree: Boolean(requested.glutenFree) && allowed.glutenFree,
    sugarFree: Boolean(requested.sugarFree) && allowed.sugarFree,
  };
}

