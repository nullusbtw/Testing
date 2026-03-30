import React from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductViewPage } from "./pages/ProductViewPage";
import { ProductEditPage } from "./pages/ProductEditPage";
import { DishesPage } from "./pages/DishesPage";
import { DishViewPage } from "./pages/DishViewPage";
import { DishEditPage } from "./pages/DishEditPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Книга рецептов</h1>
        <nav className="app-nav">
          <Link className="nav-link" to="/products">
            Продукты
          </Link>
          <Link className="nav-link" to="/dishes">
            Блюда
          </Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductEditPage mode="create" />} />
        <Route path="/products/:id" element={<ProductViewPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage mode="edit" />} />

        <Route path="/dishes" element={<DishesPage />} />
        <Route path="/dishes/new" element={<DishEditPage mode="create" />} />
        <Route path="/dishes/:id" element={<DishViewPage />} />
        <Route path="/dishes/:id/edit" element={<DishEditPage mode="edit" />} />
      </Routes>
    </div>
  );
}

