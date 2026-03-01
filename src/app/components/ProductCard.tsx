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

  const hasSale = typeof p.salePrice === "number" && p.salePrice > 0;

  return (
    <div className="pc">
      {/* FOTO */}
      <div className="pcImgWrap">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="pcImg"
            src={p.image}
            alt={p.title}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="pcNoImg">🛒</div>
        )}
      </div>

      {/* TEXT */}
      <div className="pcBody">
        <div className="pcTitle">{p.title}</div>

        <div className="pcPrices">
          {hasSale ? (
            <>
              <span className="pcOld">{p.price} тг</span>
              <span className="pcSale">{p.salePrice} тг</span>
            </>
          ) : (
            <span className="pcNormal">{p.price} тг</span>
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
                1
              );
              window.dispatchEvent(
                new CustomEvent("toast", {
                  detail: { text: "Добавлено в корзину" },
                })
              );
            }}
          >
            +
          </button>
        ) : (
          <div className="pcQty">
            <button onClick={() => setQty(p.id, qty - 1)}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(p.id, qty + 1)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}