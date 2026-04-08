import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCreateDish, apiDeleteDish, apiGetDishes, apiGetDish, apiGetProducts, apiUpdateDish, type Dish, type DishInput, type Product } from "../api";

const DISH_CATEGORIES = ["Десерт", "Первое", "Второе", "Напиток", "Салат", "Суп", "Перекус"];

type MacroParse = { macroCategoryRu: string | null; sanitizedName: string };

function parseFirstMacroFromName(name: string): MacroParse {
  const macros: Array<{ token: string; categoryRu: string }> = [
    { token: "!десерт", categoryRu: "Десерт" },
    { token: "!первое", categoryRu: "Первое" },
    { token: "!второе", categoryRu: "Второе" },
    { token: "!напиток", categoryRu: "Напиток" },
    { token: "!салат", categoryRu: "Салат" },
    { token: "!суп", categoryRu: "Суп" },
    { token: "!перекус", categoryRu: "Перекус" },
  ];

  const lower = name.toLowerCase();
  let first: { index: number; token: string; categoryRu: string } | null = null;
  for (const m of macros) {
    const idx = lower.indexOf(m.token);
    if (idx === -1) continue;
    if (!first || idx < first.index) first = { index: idx, token: m.token, categoryRu: m.categoryRu };
  }
  if (!first) return { macroCategoryRu: null, sanitizedName: name.trim() };
  const sanitized = name.slice(0, first.index) + name.slice(first.index + first.token.length);
  return { macroCategoryRu: first.categoryRu, sanitizedName: sanitized.replace(/\s+/g, " ").trim() };
}

function parsePhotosText(photosText: string) {
  return photosText
    // Важно: для data URL (base64) внутри строки есть запятые,
    // поэтому разделяем только по переносам строк.
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function DishEditPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const dishId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [size, setSize] = useState(100);

  // В create по умолчанию оставляем авто-режим (категория будет взята из макроса).
  const [categoryTouched, setCategoryTouched] = useState(mode === "edit");
  const [categorySelected, setCategorySelected] = useState<string>(DISH_CATEGORIES[0]);

  const [items, setItems] = useState<Array<{ productId: number; quantity: number }>>([]);

  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [sugarFree, setSugarFree] = useState(false);

  // КБЖУ в форме (сервер пересчитает и перезапишет при сохранении)
  const [calories, setCalories] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [fats, setFats] = useState(0);
  const [carbs, setCarbs] = useState(0);

  const roundTo = (v: number, decimals: number) => {
    const p = 10 ** decimals;
    return Math.round(v * p) / p;
  };

  const normalizeQuantity = (q: number) => {
    // Сервер требует quantity >= 0.01
    const n = Number.isFinite(q) ? q : 0;
    return Math.max(0.01, roundTo(n, 2));
  };

  useEffect(() => {
    apiGetProducts({}).then((data) => setProducts(data.items)).catch((e) => setError(String(e?.message ?? e)));
  }, []);

  const derived = useMemo(() => parseFirstMacroFromName(name), [name]);

  // Вычисляем доступные флаги (которые есть у ВСЕх продуктов)
  const allowedFlags = useMemo(() => {
    if (items.length === 0) {
      return { vegan: false, glutenFree: false, sugarFree: false };
    }
    const all = items.length > 0;
    const vegan = all && items.every((it) => {
      const p = productById.get(it.productId);
      return p?.vegan ?? false;
    });
    const glutenFree = all && items.every((it) => {
      const p = productById.get(it.productId);
      return p?.glutenFree ?? false;
    });
    const sugarFree = all && items.every((it) => {
      const p = productById.get(it.productId);
      return p?.sugarFree ?? false;
    });
    return { vegan, glutenFree, sugarFree };
  }, [items, productById]);

  // Локальный пересчёт КБЖУ при изменении состава.
  useEffect(() => {
    if (items.length === 0) {
      setCalories(0);
      setProteins(0);
      setFats(0);
      setCarbs(0);
      return;
    }

    let c = 0;
    let b = 0;
    let f = 0;
    let u = 0;
    for (const it of items) {
      const p = productById.get(it.productId);
      if (!p) continue;
      const ratio = normalizeQuantity(it.quantity) / 100;
      c += p.caloriesPer100 * ratio;
      b += p.proteinsPer100 * ratio;
      f += p.fatsPer100 * ratio;
      u += p.carbsPer100 * ratio;
    }

    // Округляем, чтобы не ловить step/валидацию на input[type=number].
    setCalories(roundTo(c, 2));
    setProteins(roundTo(b, 2));
    setFats(roundTo(f, 2));
    setCarbs(roundTo(u, 2));
  }, [items, productById]);

  // Сбрасываем флаги если они больше не доступны
  useEffect(() => {
    if (!allowedFlags.vegan && vegan) setVegan(false);
    if (!allowedFlags.glutenFree && glutenFree) setGlutenFree(false);
    if (!allowedFlags.sugarFree && sugarFree) setSugarFree(false);
  }, [allowedFlags]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(dishId)) {
      setError("Некорректный id");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiGetDish(dishId)
      .then((res) => {
        const d: Dish = res.dish;
        setName(d.name);
        setPhotos(d.photos ?? []);
        setSize(d.size);
        setCategorySelected(d.category);
        setCategoryTouched(true);
        setItems(d.composition.map((x) => ({ productId: x.product.id, quantity: x.quantity })));
        setVegan(d.vegan);
        setGlutenFree(d.glutenFree);
        setSugarFree(d.sugarFree);
      })
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [mode, dishId]);

  const effectiveCategoryForSelect = useMemo(() => {
    if (categoryTouched) return categorySelected;
    return derived.macroCategoryRu ?? "";
  }, [categoryTouched, categorySelected, derived.macroCategoryRu]);

  const isValid = (() => {
    if (name.trim().length < 2) return false;
    if (derived.sanitizedName.trim().length < 2) return false;
    if (size <= 0) return false;
    if (items.length < 1) return false;
    const macro = derived.macroCategoryRu;
    if (!categoryTouched && !macro) return false;
    return true;
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const macro = derived.macroCategoryRu;
    if (!categoryTouched && !macro) {
      setError("Нужно указать категорию или добавить макрос в названии блюда.");
      return;
    }

    const payload: DishInput = {
      name,
      photos: photos.slice(0, 5),
      size: Math.max(0.0001, Number(size)),
      items: items.map((it) => ({ ...it, quantity: normalizeQuantity(it.quantity) })),
      vegan,
      glutenFree,
      sugarFree,
      calories: roundTo(calories, 2),
      proteins: roundTo(proteins, 2),
      fats: roundTo(fats, 2),
      carbs: roundTo(carbs, 2),
      ...(categoryTouched ? { category: categorySelected } : {}),
    };

    if (payload.items.length < 1) {
      setError("Добавьте хотя бы один продукт в состав.");
      return;
    }

    try {
      const res =
        mode === "create" ? await apiCreateDish(payload) : await apiUpdateDish(dishId, payload);
      const createdDish = res.dish;
      navigate(`/dishes/${createdDish.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  const [productIdToAdd, setProductIdToAdd] = useState<number>(0);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(50);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title" style={{ marginTop: 0, marginBottom: 12 }}>
          {mode === "create" ? "Новое блюдо" : "Редактирование блюда"}
        </h2>

        <form
          onSubmit={onSubmit}
          noValidate
          className="recipe-form"
          style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10 }}
        >
          <div style={{ gridColumn: "span 12" }}>
          <label style={{ marginLeft: '8px' }}>Название (можно использовать макросы: !десерт, !первое, ...)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
          {derived.macroCategoryRu && (
            <div style={{ marginTop: 6, color: "#333", fontSize: 12 }}>
              Найден макрос: категория автоматически {derived.macroCategoryRu} (сервер удалит макрос из названия)
            </div>
          )}
          </div>

        <div style={{ gridColumn: "span 6" }}>
          <label style={{ marginLeft: '8px' }}>Размер порции (г)</label>
          <input type="number" min={0} step="0.01" value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: "100%" }} />
        </div>

        <div style={{ gridColumn: "span 6" }}>
          <label style={{ marginLeft: '8px' }}>Категория</label>
          <select
            value={effectiveCategoryForSelect}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                setCategorySelected(v);
                setCategoryTouched(true);
              } else {
                setCategoryTouched(false);
              }
            }}
            style={{ width: "100%" }}
          >
            <option value="">Авто (по макросу)</option>
            {DISH_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
            <label style={{ marginLeft: '8px' }}>Загрузить фото ({photos.length}/5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={photos.length >= 5}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                const room = Math.max(0, 5 - photos.length);
                if (room <= 0) {
                  setError("Лимит фото: максимум 5. Сначала удалите лишние фото.");
                  return;
                }

                const toDataUrl = (file: File) =>
                  new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
                    reader.readAsDataURL(file);
                  });

                const arr = Array.from(files).slice(0, room);
                try {
                  const newOnes = await Promise.all(arr.map(toDataUrl));
                  setPhotos([...photos, ...newOnes].slice(0, 5));
                  setError(null);
                } catch (err: any) {
                  setError(String(err?.message ?? err));
                } finally {
                  // Чтобы одно и то же фото можно было загрузить повторно
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <h3 style={{ margin: "10px 0 6px" }}>Состав</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ marginLeft: '8px' }}>Продукт</label>
              <select value={productIdToAdd} onChange={(e) => setProductIdToAdd(Number(e.target.value))}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ marginLeft: '8px' }}>Количество (г)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              />
            </div>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                if (!productIdToAdd) return;
                const raw = Number(quantityToAdd);
                if (!Number.isFinite(raw) || raw < 0.01) {
                  setError("Количество (г) должно быть >= 0.01");
                  return;
                }
                setItems((prev) => {
                  if (prev.some((x) => x.productId === productIdToAdd)) return prev;
                  return [...prev, { productId: productIdToAdd, quantity: normalizeQuantity(raw) }];
                });
              }}
            >
              Добавить
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ marginTop: 10, color: "#666" }}>Пока пусто</div>
          ) : (
            <table className="recipe-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Продукт</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Кол-во</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", paddingBottom: 6 }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.productId}>
                    <td style={{ padding: "8px 0" }}>{productById.get(it.productId)?.name ?? it.productId}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.quantity}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity: normalizeQuantity(q) } : x)));
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((x) => x.productId !== it.productId))}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <label>Ккал/порция</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={calories}
            onChange={(e) => setCalories(roundTo(Number(e.target.value), 2))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label>Б (г)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={proteins}
            onChange={(e) => setProteins(roundTo(Number(e.target.value), 2))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label>Ж (г)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={fats}
            onChange={(e) => setFats(roundTo(Number(e.target.value), 2))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label>У (г)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={carbs}
            onChange={(e) => setCarbs(roundTo(Number(e.target.value), 2))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ gridColumn: "span 12", display: "flex", gap: 14 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={vegan} onChange={(e) => setVegan(e.target.checked)} disabled={!allowedFlags.vegan} />
            Веган
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={glutenFree} onChange={(e) => setGlutenFree(e.target.checked)} disabled={!allowedFlags.glutenFree} />
            Без глютена
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={sugarFree} onChange={(e) => setSugarFree(e.target.checked)} disabled={!allowedFlags.sugarFree} />
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
            onClick={() => navigate(mode === "edit" ? `/dishes/${dishId}` : "/dishes")}
          >
            Отмена
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

