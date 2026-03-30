import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiDeleteProduct, apiGetProducts, type Product } from "../api";

const PRODUCT_CATEGORIES = ["Замороженный", "Мясной", "Овощи", "Зелень", "Специи", "Крупы", "Консервы", "Жидкость", "Сладости"];
const COOKING_NEEDS = ["Готовый к употреблению", "Полуфабрикат", "Требует приготовления"];

export function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [cookingNeed, setCookingNeed] = useState<string>("");
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [sugarFree, setSugarFree] = useState(false);
  const [sort, setSort] = useState<"name" | "calories" | "proteins" | "fats" | "carbs">("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      cookingNeed: cookingNeed || undefined,
      vegan: vegan || undefined,
      glutenFree: glutenFree || undefined,
      sugarFree: sugarFree || undefined,
      sort,
      dir,
    }),
    [search, category, cookingNeed, vegan, glutenFree, sugarFree, sort, dir],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGetProducts(query)
      .then((data) => setItems(data.items))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Продукты</h2>
        <Link to="/products/new" className="btn btn-primary">
          + Добавить продукт
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ gridColumn: "span 4" }}>
          <label>Поиск</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Подстрочный поиск" style={{ width: "100%" }} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label>Категория</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
            <option value="">Любая</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label>Готовка</label>
          <select value={cookingNeed} onChange={(e) => setCookingNeed(e.target.value)} style={{ width: "100%" }}>
            <option value="">Любая</option>
            {COOKING_NEEDS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label>Сортировка</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ width: "100%" }}>
              <option value="name">Название</option>
              <option value="calories">Калории</option>
              <option value="proteins">Белки</option>
              <option value="fats">Жиры</option>
              <option value="carbs">Углеводы</option>
            </select>
            <select value={dir} onChange={(e) => setDir(e.target.value as any)} style={{ width: 120 }}>
              <option value="asc">↑</option>
              <option value="desc">↓</option>
            </select>
          </div>
        </div>

        <div style={{ gridColumn: "span 12", display: "flex", gap: 14, marginTop: 6 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={vegan} onChange={(e) => setVegan(e.target.checked)} />
            Веган
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={glutenFree} onChange={(e) => setGlutenFree(e.target.checked)} />
            Без глютена
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={sugarFree} onChange={(e) => setSugarFree(e.target.checked)} />
            Без сахара
          </label>
        </div>
      </div>

      {loading && <div>Загрузка...</div>}
      {error && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <table className="recipe-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Название</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Категория</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Готовка</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Ккал/100</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Б/Ж/У</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Флаги</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: "10px 0" }}>
                <Link to={`/products/${p.id}`}>{p.name}</Link>
              </td>
              <td>{p.category}</td>
              <td>{p.cookingNeed}</td>
              <td>{p.caloriesPer100}</td>
              <td>
                {p.proteinsPer100}/{p.fatsPer100}/{p.carbsPer100}
              </td>
              <td>
                {[p.vegan ? "Веган" : null, p.glutenFree ? "Без глютена" : null, p.sugarFree ? "Без сахара" : null]
                  .filter(Boolean)
                  .join(", ")}
              </td>
              <td>
                <Link to={`/products/${p.id}/edit`} className="btn btn-secondary btn-sm">
                  Редактировать
                </Link>{" "}
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    const ok = confirm(`Удалить продукт "${p.name}"?`);
                    if (!ok) return;
                    const res = await apiDeleteProduct(p.id);
                    if (res.status === 204) {
                      setItems((prev) => prev.filter((x) => x.id !== p.id));
                      return;
                    }
                    const msg = res.body?.error?.message ?? `Ошибка ${res.status}`;
                    const usedIn = res.body?.error?.details?.usedIn as Array<{ id: number; name: string }> | undefined;
                    if (usedIn && usedIn.length > 0) {
                      alert(`${msg}\n\nИспользуется в блюдах:\n${usedIn.map((d) => `- ${d.name} (id=${d.id})`).join("\n")}`);
                      return;
                    }
                    alert(msg);
                  }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 12, color: "#666" }}>
                Нет продуктов по заданным фильтрам.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

