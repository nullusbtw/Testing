import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetProduct, type Product } from "../api";

export function ProductViewPage() {
  const { id } = useParams();
  const productId = Number(id);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setError("Некорректный id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    apiGetProduct(productId)
      .then((res) => setProduct(res.product))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
  if (!product) return <div>Не найдено</div>;

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{product.name}</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to={`/products/${product.id}/edit`} className="btn btn-secondary btn-sm">
            Редактировать
          </Link>
          <Link to="/products" className="btn btn-secondary btn-sm">
            Назад
          </Link>
        </div>
      </div>

      {product.photos.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {product.photos.map((ph, idx) => (
            <div key={ph + idx}>
              <img src={ph} alt={product.name} style={{ maxWidth: 240, display: "block", marginBottom: 8 }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10 }}>
        <div style={{ gridColumn: "span 6" }}>
          <b>Категория:</b> {product.category}
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <b>Готовка:</b> {product.cookingNeed}
        </div>

        <div style={{ gridColumn: "span 4" }}>
          <b>Ккал/100г:</b> {product.caloriesPer100}
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <b>Б/Ж/У:</b> {product.proteinsPer100}/{product.fatsPer100}/{product.carbsPer100}
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <b>Состав (описание):</b> {product.composition ?? "—"}
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <b>Флаги:</b>{" "}
          {[product.vegan ? "Веган" : null, product.glutenFree ? "Без глютена" : null, product.sugarFree ? "Без сахара" : null]
            .filter(Boolean)
            .join(", ") || "—"}
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <b>Дата создания:</b> {new Date(product.createdAt).toLocaleString()}
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <b>Дата редактирования:</b> {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "—"}
        </div>
      </div>
    </div>
  );
}

