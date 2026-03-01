"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readCart, setQty, clearCart, type CartItem } from "../lib/cart";

const FREE_FROM = Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_FROM || 5000);
const FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || 300);

function itemPrice(i: CartItem) {
  return typeof i.salePrice === "number" && i.salePrice > 0 ? i.salePrice : i.price;
}

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const refresh = () => setItems(readCart());

  useEffect(() => {
    refresh();
    window.addEventListener("cartUpdated", refresh);
    return () => window.removeEventListener("cartUpdated", refresh);
  }, []);

  const sum = useMemo(
    () => items.reduce((acc, i) => acc + itemPrice(i) * i.qty, 0),
    [items]
  );

  const delivery = sum >= FREE_FROM || sum === 0 ? 0 : FEE;
  const total = sum + delivery;

  return (
    <main className="main">
      <div className="sectionTitle" style={{ fontSize: 20, marginBottom: 12 }}>
        🛒 Корзина
      </div>

      {items.length === 0 ? (
        <div className="muted">
          Корзина пустая. <Link className="link" href="/">В каталог</Link>
        </div>
      ) : (
        <>
          <div className="cartList">
            {items.map((i) => (
              <div key={i.id} className="cartRow">
                <div>
                  <div className="cartTitle">{i.title}</div>
                  <div className="muted">
                    {itemPrice(i)} тг × {i.qty} = {itemPrice(i) * i.qty} тг
                  </div>
                </div>

                <div className="qty">
                  <button onClick={() => setItems(setQty(i.id, i.qty - 1))}>-</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setItems(setQty(i.id, i.qty + 1))}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary">
            <div className="row">
              <span>Товары</span><b>{sum} тг</b>
            </div>

            <div className="row">
              <span>Доставка</span>
              <b>
                {delivery === 0
                  ? (sum >= FREE_FROM ? "Бесплатно" : "0 тг")
                  : `${delivery} тг`}
              </b>
            </div>

            <div className="row total">
              <span>Итого</span><b>{total} тг</b>
            </div>

            <div className="cartActions">
              <button
                className="clearBtn"
                onClick={() => {
                  clearCart();
                  setItems([]);
                }}
              >
                Очистить
              </button>

              <button
                className="checkoutBtn"
                onClick={() => router.push("/checkout")}
              >
                Оформить
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}