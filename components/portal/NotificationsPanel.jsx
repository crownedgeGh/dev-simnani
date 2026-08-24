"use client";

import { useState } from "react";
import Tabs from "./Tabs";
import Switch from "./Switch";
import EmptyState from "./EmptyState";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "settings", label: "Settings" },
];

export default function NotificationsPanel({ notifications, categories }) {
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState(notifications);
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(categories.map((c) => [c.key, c.defaultOn]))
  );

  const visible = tab === "unread" ? items.filter((n) => n.unread) : items;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        {tab !== "settings" && (
          <button
            type="button"
            onClick={markAllRead}
            className="tracked-label text-xs text-gold-400 hover:text-gold-300"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {tab === "settings" ? (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className="flex items-center justify-between border border-navy-700/60 bg-navy-900 p-4"
            >
              <div>
                <p className="text-sm text-cream">{cat.label}</p>
                <p className="mt-1 text-xs text-muted">{cat.description}</p>
              </div>
              <Switch
                checked={prefs[cat.key]}
                disabled={cat.locked}
                onChange={(value) => setPrefs((prev) => ({ ...prev, [cat.key]: value }))}
              />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title="You're all caught up." message="No new notifications require your attention." />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className={`border bg-navy-900 p-4 ${
                item.unread ? "border-gold-400/60" : "border-navy-700/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-cream">{item.title}</p>
                {item.unread && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />}
              </div>
              <p className="mt-1 text-xs text-muted">{item.body}</p>
              <p className="tracked-label mt-2 text-[10px] text-muted">{item.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
