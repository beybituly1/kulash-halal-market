"use client";

import { useEffect, useState } from "react";
import type { Product } from "../lib/types";
import { addToCart, readCart, setQty } from "../lib/cart";

function qtyOf(id: string) {
  return readCart().find((i) => i.id === id)?.qty ?? 0;
}

export default function ProductCard({ p }: { p: Product }) {
  const [qty, setLocalQty] = useState(0);

  useEffect(() => {
    const sync = () => setLocalQty(qtyOf(p.id));
    sync();

    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, [p.id]);

  const isKg = p.unit === "кг";
  const step = isKg ? 0.5 : 1;
  const min = isKg ? 0.5 : 1;

  const showPrice = (v: number) => `${v} тг${isKg ? " / кг" : ""}`;

  return (
    <div className="pc">
      <div className="pcImgWrap">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} />
        ) : (
          <div className="pcNoImg">🛒</div>
        )}
      </div>

      <div className="pcBody">
        <div className="pcTitle">{p.title}</div>

        <div className="pcPrices">
          {p.salePrice ? (
            <>
              <span className="pcOld">{showPrice(p.price)}</span>
              <span className="pcSale">{showPrice(p.salePrice)}</span>
            </>
          ) : (
            <span className="pcNormal">{showPrice(p.price)}</span>
          )}
        </div>

        {qty === 0 ? (
          <button
            className="pcAdd"
            onClick={() => {
              addToCart(
                {
                  id: p.id,
                  title: p.title,
                  price: p.price,
                  salePrice: p.salePrice,
                },
                min // ✅ для кг старт 0.5
              );
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: { text: "Добавлено в корзину" },
                })
              );
            }}
            type="button"
          >
            +
          </button>
        ) : (
          <div className="pcQty">
            <button
              type="button"
              onClick={() => setQty(p.id, qty - step)}
              aria-label="Уменьшить"
            >
              −
            </button>

            <span>
              {isKg ? `${qty.toFixed(1)} кг` : qty}
            </span>

            <button
              type="button"
              onClick={() => setQty(p.id, qty + step)}
              aria-label="Увеличить"
            >
              +
            </button>
          </div>
        )}

        {/* маленькая подсказка для весовых */}
        {isKg ? <div className="muted" style={{ marginTop: 6 }}>Мин: 0.5 кг</div> : null}
      </div>
    </div>
  );
}