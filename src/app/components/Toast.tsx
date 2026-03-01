"use client";

import { useEffect, useState } from "react";

export default function Toast() {
  const [text, setText] = useState<string>("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t: any;

    const onToast = (e: any) => {
      const msg = String(e?.detail?.text || "Готово");
      setText(msg);
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 1800);
    };

    window.addEventListener("toast", onToast);
    return () => {
      clearTimeout(t);
      window.removeEventListener("toast", onToast);
    };
  }, []);

  if (!show) return null;

  return <div className="toast">{text}</div>;
}