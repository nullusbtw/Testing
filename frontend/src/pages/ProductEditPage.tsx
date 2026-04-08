import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCreateProduct, apiGetProduct, apiUpdateProduct, type Product, type ProductInput } from "../api";

const PRODUCT_CATEGORIES = ["Замороженный", "Мясной", "Овощи", "Зелень", "Специи", "Крупы", "Консервы", "Жидкость", "Сладости"];
const COOKING_NEEDS = ["Готовый к употреблению", "Полуфабрикат", "Требует приготовления"];

export function ProductEditPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [caloriesPer100, setCaloriesPer100] = useState(0);
  const [proteinsPer100, setProteinsPer100] = useState(0);
  const [fatsPer100, setFatsPer100] = useState(0);
  const [carbsPer100, setCarbsPer100] = useState(0);
  const [composition, setComposition] = useState("");
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [cookingNeed, setCookingNeed] = useState(COOKING_NEEDS[0]);
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [sugarFree, setSugarFree] = useState(false);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(productId)) {
      setError("Некорректный id");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGetProduct(productId)
      .then((res) => {
        const p: Product = res.product;
        setName(p.name);
        setPhotos(p.photos ?? []);
        setCaloriesPer100(p.caloriesPer100);
        setProteinsPer100(p.proteinsPer100);
        setFatsPer100(p.fatsPer100);
        setCarbsPer100(p.carbsPer100);
        setComposition(p.composition ?? "");
        setCategory(p.category);
        setCookingNeed(p.cookingNeed);
        setVegan(p.vegan);
        setGlutenFree(p.glutenFree);
        setSugarFree(p.sugarFree);
      })
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [mode, productId]);

  const isValid = (() => {
    if (name.trim().length < 2) return false;
    if (caloriesPer100 < 0) return false;
    if (proteinsPer100 < 0) return false;
    if (fatsPer100 < 0) return false;
    if (carbsPer100 < 0) return false;
    if (!category) return false;
    if (!cookingNeed) return false;
    return true;
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: ProductInput = {
      name,
      photos,
      caloriesPer100: Number(caloriesPer100),
      proteinsPer100: Number(proteinsPer100),
      fatsPer100: Number(fatsPer100),
      carbsPer100: Number(carbsPer100),
      composition: composition.trim() ? composition.trim() : null,
      category,
      cookingNeed,
      vegan,
      glutenFree,
      sugarFree,
    };

    try {
      const res =
        mode === "create"
          ? await apiCreateProduct(input)
          : await apiUpdateProduct(productId, input);

      const created = mode === "create" ? res.product : res.product;
      navigate(`/products/${created.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title" style={{ marginTop: 0, marginBottom: 12 }}>
          {mode === "create" ? "Новый продукт" : "Редактирование продукта"}
        </h2>

        <form
          onSubmit={onSubmit}
          className="recipe-form"
          style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10 }}
        >
          <div style={{ gridColumn: "span 6" }}>
          <label style={{ marginLeft: '8px' }}>Название</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
          </div>

        <div style={{ gridColumn: "span 6" }}>
          <label style={{ marginLeft: '8px' }}>Категория</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <label style={{ marginLeft: '8px' }}>Необходимость готовки</label>
          <select value={cookingNeed} onChange={(e) => setCookingNeed(e.target.value)} style={{ width: "100%" }}>
            {COOKING_NEEDS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <label style={{ marginLeft: '8px' }}>Состав (описание)</label>
          <textarea value={composition} onChange={(e) => setComposition(e.target.value)} style={{ width: "100%", minHeight: 80 }} />
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <label style={{ marginLeft: '8px' }}>Ккал/100г</label>
          <input type="number" min={0} step="0.01" value={caloriesPer100} onChange={(e) => setCaloriesPer100(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label style={{ marginLeft: '8px' }}>Белки г/100г</label>
          <input type="number" min={0} step="0.01" value={proteinsPer100} onChange={(e) => setProteinsPer100(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label style={{ marginLeft: '8px' }}>Жиры г/100г</label>
          <input type="number" min={0} step="0.01" value={fatsPer100} onChange={(e) => setFatsPer100(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label style={{ marginLeft: '8px' }}>Углеводы г/100г</label>
          <input type="number" min={0} step="0.01" value={carbsPer100} onChange={(e) => setCarbsPer100(Number(e.target.value))} style={{ width: "100%" }} />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <label style={{ marginLeft: '8px' }}>Фотографии</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
            {photos.map((photo, index) => (
              <div key={index} style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={photo}
                  alt={`Фото ${index + 1}`}
                  style={{ width: 80, height: 80, objectFit: "cover", border: "1px solid #ddd", borderRadius: 4 }}
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Удалить фото"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div>
            <label style={{ marginLeft: '8px' }}>Загрузить фото</label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={photos.length >= 5}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                const room = Math.max(0, 5 - photos.length);
                if (room <= 0) return;

                const toDataUrl = (file: File) =>
                  new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
                    reader.readAsDataURL(file);
                  });

                try {
                  const arr = Array.from(files).slice(0, room);
                  const newOnes = await Promise.all(arr.map(toDataUrl));
                  setPhotos([...photos, ...newOnes].slice(0, 5));
                  setError(null);
                } catch (err: any) {
                  setError(String(err?.message ?? err));
                } finally {
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>

        <div style={{ gridColumn: "span 12", display: "flex", gap: 14 }}>
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

        <div style={{ gridColumn: "span 12", display: "flex", gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" type="submit">
            {mode === "create" ? "Создать" : "Сохранить"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate(mode === "edit" ? `/products/${productId}` : "/products")}
          >
            Отмена
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

