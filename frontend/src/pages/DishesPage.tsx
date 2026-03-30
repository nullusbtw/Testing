import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetDishes, apiDeleteDish, type Dish } from "../api";

const DISH_CATEGORIES = ["Десерт", "Первое", "Второе", "Напиток", "Салат", "Суп", "Перекус"];

export function DishesPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Dish[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [sugarFree, setSugarFree] = useState(false);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      vegan: vegan || undefined,
      glutenFree: glutenFree || undefined,
      sugarFree: sugarFree || undefined,
    }),
    [search, category, vegan, glutenFree, sugarFree],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGetDishes(query)
      .then((d) => setItems(d.items))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Блюда</h2>
        <Link to="/dishes/new" className="btn btn-primary">
          + Добавить блюдо
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <label>Поиск</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Подстрочный поиск" />
        </div>
        <div>
          <label>Категория</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Любая</option>
            {DISH_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

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

      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      <table className="recipe-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Название</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Категория</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Ккал/порция</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Б/Ж/У</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Флаги</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td style={{ padding: "10px 0" }}>
                <Link to={`/dishes/${d.id}`}>{d.name}</Link>
              </td>
              <td>{d.category}</td>
              <td>{d.calories}</td>
              <td>
                {d.proteins}/{d.fats}/{d.carbs}
              </td>
              <td>
                {[d.vegan ? "Веган" : null, d.glutenFree ? "Без глютена" : null, d.sugarFree ? "Без сахара" : null]
                  .filter(Boolean)
                  .join(", ")}
              </td>
              <td>
                <Link to={`/dishes/${d.id}/edit`} className="btn btn-secondary btn-sm">
                  Редактировать
                </Link>{" "}
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    const ok = confirm(`Удалить блюдо "${d.name}"?`);
                    if (!ok) return;
                    const res = await apiDeleteDish(d.id);
                    if (res.status === 204) {
                      setItems((prev) => prev.filter((x) => x.id !== d.id));
                      return;
                    }
                    alert(res.body?.error?.message ?? `Ошибка ${res.status}`);
                  }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 12, color: "#666" }}>
                Нет блюд по фильтрам.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

