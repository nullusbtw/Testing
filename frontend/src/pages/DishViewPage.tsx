import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetDish, type Dish } from "../api";

export function DishViewPage() {
  const { id } = useParams();
  const dishId = Number(id);

  const [loading, setLoading] = useState(true);
  const [dish, setDish] = useState<Dish | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(dishId)) {
      setError("Некорректный id");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGetDish(dishId)
      .then((res) => setDish(res.dish))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [dishId]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
  if (!dish) return <div>Не найдено</div>;

  return (
    <div className="page">
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 12 }}
      >
        <h2 style={{ margin: 0 }}>{dish.name}</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to={`/dishes/${dish.id}/edit`} className="btn btn-secondary btn-sm">
            Редактировать
          </Link>
          <Link to="/dishes" className="btn btn-secondary btn-sm">
            Назад
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <b>Категория:</b> {dish.category}
      </div>

      {dish.photos.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {dish.photos.map((ph, idx) => (
            <img key={ph + idx} src={ph} alt={dish.name} style={{ maxWidth: 240, display: "block", marginBottom: 8 }} />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10, marginBottom: 14 }}>
        <div style={{ gridColumn: "span 4" }}>
          <b>Ккал/порция:</b> {dish.calories}
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <b>Б/Ж/У:</b> {dish.proteins}/{dish.fats}/{dish.carbs}
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <b>Размер порции (г):</b> {dish.size}
        </div>
        <div style={{ gridColumn: "span 12" }}>
          <b>Флаги:</b>{" "}
          {[dish.vegan ? "Веган" : null, dish.glutenFree ? "Без глютена" : null, dish.sugarFree ? "Без сахара" : null]
            .filter(Boolean)
            .join(", ") || "—"}
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <b>Дата создания:</b> {new Date(dish.createdAt).toLocaleString()}
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <b>Дата редактирования:</b> {dish.updatedAt ? new Date(dish.updatedAt).toLocaleString() : "—"}
        </div>
      </div>

      <h3 style={{ marginTop: 0 }}>Состав</h3>
      <table className="recipe-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Продукт</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Количество (г)</th>
          </tr>
        </thead>
        <tbody>
          {dish.composition.map((it, idx) => (
            <tr key={it.product.id + "_" + idx}>
              <td style={{ padding: "8px 0" }}>{it.product.name}</td>
              <td>{it.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

