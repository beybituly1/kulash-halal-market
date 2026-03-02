"use client";

import { useEffect, useRef, useState } from "react";

export type Story = {
  id: string;
  title: string;
  image: string;
};

export default function StoriesClient({ stories = [] }: { stories?: Story[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const timerRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);

  const hasStories = stories.length > 0;

  const close = () => {
    setOpen(false);
  };

  const next = () => {
    if (!stories.length) return;
    setActive((i) => (i + 1) % stories.length);
  };

  const prev = () => {
    if (!stories.length) return;
    setActive((i) => (i - 1 + stories.length) % stories.length);
  };

  // автолистание
  useEffect(() => {
    if (!open || stories.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      setActive((i) => (i + 1) % stories.length);
    }, 15000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [open, stories.length]);

  // блок скролла страницы когда сторис открыта + ESC закрыть
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stories.length]);

  if (!hasStories) return null;

  return (
    <>
      <div className="stories">
        {stories.map((s, i) => (
          <button
            key={s.id}
            className="story"
            onClick={() => {
              setActive(i);
              setOpen(true);
            }}
          >
            <div className="storyRing">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.title} />
            </div>
            <div className="storyTitle">{s.title}</div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="storyModal"
          role="dialog"
          aria-modal="true"
          onClick={close}
          onTouchStart={(e) => {
            startXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const startX = startXRef.current;
            const endX = e.changedTouches[0]?.clientX ?? null;
            startXRef.current = null;
            if (startX == null || endX == null) return;

            const dx = endX - startX;
            if (Math.abs(dx) < 40) return; // порог свайпа
            if (dx < 0) next();
            else prev();
          }}
        >
          <div className="storyModalInner" onClick={(e) => e.stopPropagation()}>
            <button className="storyClose" onClick={close} aria-label="Закрыть">
              ✕
            </button>

            {/* клик по левой/правой половине для листания */}
            <button
              className="storyTapLeft"
              onClick={prev}
              aria-label="Предыдущая"
            />
            <button
              className="storyTapRight"
              onClick={next}
              aria-label="Следующая"
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="storyBig"
              src={stories[active]?.image}
              alt={stories[active]?.title}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}