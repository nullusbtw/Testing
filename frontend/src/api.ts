const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type Product = {
  id: number;
  name: string;
  photos: string[];
  caloriesPer100: number;
  proteinsPer100: number;
  fatsPer100: number;
  carbsPer100: number;
  composition: string | null;
  category: string;
  cookingNeed: string;
  vegan: boolean;
  glutenFree: boolean;
  sugarFree: boolean;
};

export type DishCompositionItem = {
  product: Pick<Product, "id" | "name">;
  quantity: number;
};

export type Dish = {
  id: number;
  name: string;
  photos: string[];
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  size: number;
  category: string;
  vegan: boolean;
  glutenFree: boolean;
  sugarFree: boolean;
  createdAt: string;
  updatedAt: string | null;
  composition: DishCompositionItem[];
};

export type ProductsQuery = {
  category?: string;
  cookingNeed?: string;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
  search?: string;
  sort?: "name" | "calories" | "proteins" | "fats" | "carbs";
  dir?: "asc" | "desc";
};

export type DishesQuery = {
  category?: string;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
  search?: string;
};

export async function apiGetProducts(query: ProductsQuery) {
  const sp = new URLSearchParams();
  if (query.category) sp.set("category", query.category);
  if (query.cookingNeed) sp.set("cookingNeed", query.cookingNeed);
  if (query.vegan) sp.set("vegan", String(query.vegan));
  if (query.glutenFree) sp.set("glutenFree", String(query.glutenFree));
  if (query.sugarFree) sp.set("sugarFree", String(query.sugarFree));
  if (query.search) sp.set("search", query.search);
  if (query.sort) sp.set("sort", query.sort);
  if (query.dir) sp.set("dir", query.dir);

  const res = await fetch(`${API_BASE_URL}/products?${sp.toString()}`);
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json() as Promise<{ items: Product[] }>;
}

export async function apiGetProduct(id: number) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error(`Failed to load product: ${res.status}`);
  return res.json() as Promise<{ product: Product }>;
}

export type ProductInput = {
  name: string;
  photos?: string[];
  caloriesPer100: number;
  proteinsPer100: number;
  fatsPer100: number;
  carbsPer100: number;
  composition?: string | null;
  category: string;
  cookingNeed: string;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
};

export async function apiCreateProduct(input: ProductInput) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create product: ${res.status}`);
  return res.json() as Promise<{ product: Product }>;
}

export async function apiUpdateProduct(id: number, input: Partial<ProductInput>) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update product: ${res.status}`);
  return res.json() as Promise<{ product: Product }>;
}

export async function apiDeleteProduct(id: number) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

export async function apiGetDishes(query: DishesQuery) {
  const sp = new URLSearchParams();
  if (query.category) sp.set("category", query.category);
  if (query.vegan) sp.set("vegan", String(query.vegan));
  if (query.glutenFree) sp.set("glutenFree", String(query.glutenFree));
  if (query.sugarFree) sp.set("sugarFree", String(query.sugarFree));
  if (query.search) sp.set("search", query.search);

  const res = await fetch(`${API_BASE_URL}/dishes?${sp.toString()}`);
  if (!res.ok) throw new Error(`Failed to load dishes: ${res.status}`);
  return res.json() as Promise<{ items: Dish[] }>;
}

export async function apiGetDish(id: number) {
  const res = await fetch(`${API_BASE_URL}/dishes/${id}`);
  if (!res.ok) throw new Error(`Failed to load dish: ${res.status}`);
  return res.json() as Promise<{ dish: Dish }>;
}

export type DishInput = {
  name: string;
  photos?: string[];
  size: number;
  category?: string;
  items: Array<{ productId: number; quantity: number }>;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
};

export async function apiCreateDish(input: DishInput) {
  const res = await fetch(`${API_BASE_URL}/dishes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create dish: ${res.status}`);
  return res.json() as Promise<{ dish: Dish }>;
}

export async function apiUpdateDish(id: number, input: DishInput) {
  const res = await fetch(`${API_BASE_URL}/dishes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update dish: ${res.status}`);
  return res.json() as Promise<{ dish: Dish }>;
}

export async function apiDeleteDish(id: number) {
  const res = await fetch(`${API_BASE_URL}/dishes/${id}`, { method: "DELETE" });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

