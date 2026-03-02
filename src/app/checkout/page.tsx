"use client";

import { useEffect, useMemo, useState } from "react";
import { readCart, clearCart, type CartItem } from "../lib/cart";

type PayMethod = "cash" | "kaspi" | "halyk" | "card";
type Promo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_total: number;
  start?: string;
  end?: string;
  active: boolean;
};

const WA = process.env.NEXT_PUBLIC_WHATSAPP || "77475114101";
const SHOP = process.env.NEXT_PUBLIC_SHOP_NAME || "Kulash Halal Market";
const FREE_FROM = Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_FROM || 5000);
const FEE = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || 300);

function itemPrice(i: CartItem) {
  return typeof i.salePrice === "number" && i.salePrice > 0 ? i.salePrice : i.price;
}
function payLabel(p: PayMethod) {
  if (p === "cash") return "Наличные";
  if (p === "kaspi") return "Kaspi.kz";
  if (p === "halyk") return "Halyk";
  return "Банковская карта";
}
function upper(s: string) {
  return s.trim().toUpperCase();
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const hasWeight = items.some((i) => i.unit === "кг");
  const [mounted, setMounted] = useState(false);

  // данные клиента
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apt, setApt] = useState("");
  const [entrance, setEntrance] = useState("");
  const [comment, setComment] = useState("");

  const [pay, setPay] = useState<PayMethod>("cash");
  const [cashFrom, setCashFrom] = useState("");

  // промо
  const [promos, setPromos] = useState<Promo[]>([]);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    setMounted(true);
    setItems(readCart());

    (async () => {
      try {
        const r = await fetch("/api/promos", { cache: "no-store" });
        const j = await r.json();
        setPromos(j.promos || []);
      } catch {
        setPromos([]);
      }
    })();
  }, []);

  const sum = useMemo(
    () => items.reduce((acc, i) => acc + itemPrice(i) * i.qty, 0),
    [items]
  );

  const delivery = sum >= FREE_FROM || sum === 0 ? 0 : FEE;

  const discount = useMemo(() => {
    if (!promoApplied) return 0;
    if (!promoApplied.active) return 0;
    if (sum < (promoApplied.min_total || 0)) return 0;

    const now = new Date();

    if (promoApplied.start) {
      const s = new Date(promoApplied.start + "T00:00:00");
      if (now < s) return 0;
    }
    if (promoApplied.end) {
      const e = new Date(promoApplied.end + "T23:59:59");
      if (now > e) return 0;
    }

    let d = 0;
    if (promoApplied.type === "percent") d = Math.round((sum * promoApplied.value) / 100);
    if (promoApplied.type === "fixed") d = promoApplied.value;

    if (d > sum) d = sum;
    return d;
  }, [promoApplied, sum]);

  const total = sum + delivery - discount;

  const fullAddress = useMemo(() => {
    const parts: string[] = [];
    if (street.trim()) parts.push(`ул. ${street.trim()}`);
    if (house.trim()) parts.push(`дом ${house.trim()}`);
    if (apt.trim()) parts.push(`кв ${apt.trim()}`);
    if (entrance.trim()) parts.push(`подъезд ${entrance.trim()}`);
    return parts.join(", ");
  }, [street, house, apt, entrance]);

  const canSend =
    mounted &&
    items.length > 0 &&
    phone.trim().length >= 8 &&
    street.trim().length >= 2 &&
    house.trim().length >= 1;

  const waLink = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Здравствуйте! Хочу оформить заказ в ${SHOP} 🛒`);
    lines.push("");

    const fio = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (fio) lines.push(`Имя: ${fio}`);
    if (phone.trim()) lines.push(`Телефон: ${phone.trim()}`);
    if (fullAddress) lines.push(`Адрес: ${fullAddress}`);
    if (comment.trim()) lines.push(`Комментарий: ${comment.trim()}`);

    lines.push("");
    lines.push(`Оплата: ${payLabel(pay)}`);
    if (pay === "cash" && cashFrom.trim()) lines.push(`Сдача с: ${cashFrom.trim()} тг`);

    if (promoApplied && discount > 0) {
      lines.push(`Промокод: ${promoApplied.code}`);
      lines.push(`Скидка: -${discount} тг`);
    }

    lines.push("");
    lines.push("Состав заказа:");
    items.forEach((i, idx) => {
      lines.push(`${idx + 1}) ${i.title} — ${i.qty} шт — ${itemPrice(i) * i.qty} тг`);
    });
    const hasWeight = items.some((i) => i.unit === "кг");

if (hasWeight) {
  lines.push("");
  lines.push("⚠️ Весовые товары взвешиваются при сборке.");
  lines.push("Итоговая сумма может немного измениться.");
}

    lines.push("");
    lines.push(`Товары: ${sum} тг`);
    lines.push(
      `Доставка: ${
        delivery === 0 ? (sum >= FREE_FROM ? "Бесплатно" : "0 тг") : `${delivery} тг`
      }`
    );
    if (discount > 0) lines.push(`Скидка: -${discount} тг`);
    lines.push(`Итого: ${total} тг`);

    return `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [
    SHOP,
    pay,
    cashFrom,
    promoApplied,
    discount,
    items,
    sum,
    delivery,
    total,
    firstName,
    lastName,
    phone,
    fullAddress,
    comment,
  ]);

  const applyPromo = () => {
    const code = upper(promoInput);
    if (!code) return;

    const found = promos.find((p) => upper(p.code) === code && p.active);
    if (!found) {
      setPromoApplied(null);
      setPromoError("Промокод не найден или выключен");
      return;
    }
    if (sum < (found.min_total || 0)) {
      setPromoApplied(null);
      setPromoError(`Минимальная сумма: ${found.min_total} тг`);
      return;
    }

    setPromoApplied(found);
    setPromoError("");
  };

  if (!mounted) return null;

  return (
    <main className="main">
      <div className="sectionTitle" style={{ fontSize: 20, marginBottom: 12 }}>
        ✅ Оформление
      </div>
      {hasWeight && (
  <div className="notice">
    ⚠️ Внимание: весовые товары взвешиваются при сборке заказа.
    Итоговая сумма может немного измениться. Мы согласуем с вами перед доставкой.
  </div>
)}

      {items.length === 0 ? (
        <div className="muted">Корзина пустая</div>
      ) : (
        <>
          <div className="form">
            <div className="formGrid2">
              <label>
                Имя
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Имя" />
              </label>
              <label>
                Фамилия
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Фамилия" />
              </label>
            </div>

            <label>
              Телефон *
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+77..." />
            </label>

            <div className="formGrid2">
              <label>
                Улица *
                <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Улица" />
              </label>
              <label>
                Дом *
                <input value={house} onChange={(e) => setHouse(e.target.value)} placeholder="Дом" />
              </label>
            </div>

            <div className="formGrid2">
              <label>
                Квартира
                <input value={apt} onChange={(e) => setApt(e.target.value)} placeholder="Кв" />
              </label>
              <label>
                Подъезд
                <input value={entrance} onChange={(e) => setEntrance(e.target.value)} placeholder="Подъезд" />
              </label>
            </div>

            <label>
              Комментарий
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Домофон/этаж/не звонить" />
            </label>

            <div className="payBox">
              <div className="payTitle">Способ оплаты</div>
              <div className="payRow">
                <button type="button" className={`payBtn ${pay === "cash" ? "active" : ""}`} onClick={() => setPay("cash")}>
                  💵 Наличные
                </button>
                <button type="button" className={`payBtn ${pay === "kaspi" ? "active" : ""}`} onClick={() => setPay("kaspi")}>
                  🟣 Kaspi
                </button>
                <button type="button" className={`payBtn ${pay === "halyk" ? "active" : ""}`} onClick={() => setPay("halyk")}>
                  🟢 Halyk
                </button>
                <button type="button" className={`payBtn ${pay === "card" ? "active" : ""}`} onClick={() => setPay("card")}>
                  💳 Карта
                </button>
              </div>

              {pay === "cash" && (
                <label style={{ marginTop: 10 }}>
                  Сдача с суммы (если нужно)
                  <input value={cashFrom} onChange={(e) => setCashFrom(e.target.value)} placeholder="Например 10000" />
                </label>
              )}
            </div>

            <div className="payBox">
              <div className="payTitle">Промокод</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ flex: 1 }}
                  placeholder="Например WELCOME10"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoError("");
                  }}
                />
                <button type="button" className="payBtn" onClick={applyPromo}>
                  Применить
                </button>
              </div>

              {promoApplied && discount > 0 && (
                <div className="hint" style={{ marginTop: 8 }}>
                  Применён: <b>{promoApplied.code}</b> — скидка <b>-{discount} тг</b>
                  <button
                    type="button"
                    className="clearBtn"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      setPromoApplied(null);
                      setPromoInput("");
                      setPromoError("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {promoError && (
                <div className="hint" style={{ marginTop: 8, color: "#ff6b6b" }}>
                  {promoError}
                </div>
              )}
            </div>
          </div>

          <div className="summary">
            <div className="row"><span>Товары</span><b>{sum} тг</b></div>
            <div className="row">
              <span>Доставка</span>
              <b>{delivery === 0 ? (sum >= FREE_FROM ? "Бесплатно" : "0 тг") : `${delivery} тг`}</b>
            </div>
            <div className="row"><span>Скидка</span><b>-{discount} тг</b></div>
            <div className="row total"><span>Итого</span><b>{total} тг</b></div>

            <a
              className={`btnPrimary ${canSend ? "" : "disabled"}`}
              href={canSend ? waLink : undefined}
              onClick={() => {
                if (!canSend) return;
                setTimeout(() => clearCart(), 1200);
              }}
            >
              Отправить в WhatsApp
            </a>

            {!canSend && (
              <div className="hint">
                Заполни минимум: <b>Телефон</b>, <b>Улица</b>, <b>Дом</b>.
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}