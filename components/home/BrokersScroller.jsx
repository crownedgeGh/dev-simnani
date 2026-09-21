"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BiBuildingHouse } from "react-icons/bi";
import { MdVerified } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import CallNowButton from "@/components/home/CallNowButton";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function BrokerAvatar({ name }) {
  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg text-gold-400 sm:h-16 sm:w-16 sm:text-xl"
      style={{
        background: "radial-gradient(circle, rgba(255,198,51,0.15) 0%, rgba(255,198,51,0.04) 100%)",
        border: "1.5px solid rgba(255,198,51,0.5)",
        boxShadow: "0 0 18px rgba(255,198,51,0.2), inset 0 0 12px rgba(255,198,51,0.06)",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

const SCROLL_STEP = 320;

export default function BrokersScroller({ brokers }) {
  const scrollerRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);

  function scrollByAmount(amount) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function handleScroll(e) {
    setIsAtStart(e.currentTarget.scrollLeft <= 0);
  }

  function handleRightClick() {
    scrollByAmount(SCROLL_STEP);
  }

  return (
    <div className="relative mt-6">
      <style>{`
        .brokers-scroller {
          scrollbar-width: thin;
          scrollbar-color: var(--color-gold-500) var(--color-navy-900);
        }
        .brokers-scroller::-webkit-scrollbar {
          height: 8px;
        }
        .brokers-scroller::-webkit-scrollbar-track {
          background: var(--color-navy-900);
          border-radius: 999px;
        }
        .brokers-scroller::-webkit-scrollbar-thumb {
          background: var(--color-gold-500);
          border-radius: 999px;
        }
        .broker-card:hover {
          border-color: rgba(255,198,51,0.35) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255,198,51,0.08) !important;
          transform: translateY(-4px);
        }
      `}</style>

      {!isAtStart && (
        <button
          type="button"
          onClick={() => scrollByAmount(-SCROLL_STEP)}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/70 bg-navy-950 text-gold-400 transition hover:bg-gold-500/10 sm:flex"
        >
          <FiChevronLeft size={20} />
        </button>
      )}

      <button
        type="button"
        onClick={handleRightClick}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-gold-500/70 bg-navy-950 text-gold-400 transition hover:bg-gold-500/10 sm:flex"
      >
        <FiChevronRight size={20} />
      </button>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="brokers-scroller flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-6"
      >
        {brokers.map((broker) => (
          <div
            key={broker.accountId}
            className="broker-card relative flex w-[85%] shrink-0 snap-start flex-col rounded-xl p-5 transition-all duration-300 sm:w-[280px] lg:w-[300px]"
            style={{
              background: "linear-gradient(145deg, #0f1628 0%, #0a0e1a 100%)",
              border: "1px solid rgba(27,39,64,0.8)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            {/* Gold top accent bar */}
            <div
              className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,198,51,0.6), transparent)",
              }}
            />

            <div className="flex flex-col">
              {/* Broker info */}
              <div className="flex items-center gap-2 sm:gap-3">
                <BrokerAvatar name={broker.fullName} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-display text-base text-cream">
                      {broker.fullName}
                    </p>
                    <MdVerified className="shrink-0 text-gold-400" size={14} />
                  </div>
                  <p className="truncate text-xs text-muted">
                    {[broker.city, broker.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </div>

              {/* Agency */}
              {broker.agencyName && (
                <div
                  className="mt-3 flex items-center gap-2 pt-3 text-xs text-muted sm:mt-4 sm:pt-4 sm:text-sm"
                  style={{ borderTop: "1px solid rgba(17,26,44,0.8)" }}
                >
                  <BiBuildingHouse className="shrink-0 text-gold-400" size={14} />
                  <span className="truncate">{broker.agencyName}</span>
                </div>
              )}

              {/* Stats */}
              <div
                className="mt-4 grid grid-cols-3 gap-2 pt-4"
                style={{ borderTop: "1px solid rgba(17,26,44,0.8)" }}
              >
                <div>
                  <p className="font-display text-base text-gold-400 sm:text-lg">
                    {broker.experience
                      ? `${broker.experience} ${Number(broker.experience) === 1 ? "Year" : "Years"}`
                      : "—"}
                  </p>
                  <p className="text-[11px] text-muted">Experience</p>
                </div>
                <div>
                  <p className="font-display text-base text-gold-400 sm:text-lg">
                    {broker.dealsClosed ?? 0}
                  </p>
                  <p className="text-[11px] text-muted">Deals Closed</p>
                </div>
                <div>
                  <p className="font-display text-base text-gold-400 sm:text-lg">
                    {broker.propertiesListed ?? 0}
                  </p>
                  <p className="text-[11px] text-muted">Properties Listed</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-stretch gap-2">
              <Link
                href={`/agent/${broker.accountId}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-navy-700/60 py-2.5 text-sm font-semibold text-cream transition hover:border-gold-500/50 hover:text-gold-400"
              >
                <FiEye size={16} />
                View
              </Link>
              <div className="flex-1">
                <CallNowButton mobile={broker.mobile} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
