"use client";

import { useState } from "react";

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className={`border bg-navy-900 transition ${
              isOpen ? "border-gold-400" : "border-navy-700/60"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm text-cream">{item.question}</span>
              <span className="text-gold-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <p className="border-t border-navy-700/60 px-5 py-4 text-sm text-muted">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
