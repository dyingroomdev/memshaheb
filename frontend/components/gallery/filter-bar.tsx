"use client";

import { useState } from "react";

import type { PaintingSort } from "@/lib/painting-utils";

export type FilterState = {
  query: string;
  year: number | null;
  medium: string | null;
  color: string | null;
  sort: PaintingSort;
};

type FilterBarProps = {
  years: number[];
  media: string[];
  colors: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
};

export function FilterBar({ years, media, colors, value, onChange }: FilterBarProps) {
  const [search, setSearch] = useState(value.query);

  const update = (patch: Partial<FilterState>) => {
    onChange({ ...value, ...patch });
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    update({ query: search });
  };

  return (
    <section className="sticky top-20 z-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-card/70 p-5 shadow-glow-soft backdrop-blur supports-backdrop:bg-card/90 md:flex-row md:items-center md:justify-between">
      <form onSubmit={handleSearchSubmit} className="flex w-full flex-1 items-center gap-2">
        <label className="sr-only" htmlFor="painting-search">
          Search paintings
        </label>
        <input
          id="painting-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search titles or descriptions…"
          className="w-full rounded-full border border-white/10 bg-[#141020] px-4 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          className="rounded-full border border-accent/30 bg-accent/20 px-3 py-2 text-xs font-medium text-accent transition hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Search
        </button>
      </form>

      <div className="grid w-full grid-cols-2 gap-3 text-sm sm:grid-cols-4 md:flex md:w-auto md:flex-none">
        <Select
          label="Year"
          value={value.year ? String(value.year) : ""}
          onChange={(event) =>
            update({ year: event.target.value ? Number(event.target.value) : null })
          }
          options={[{ label: "All", value: "" }, ...years.map((year) => ({ label: String(year), value: String(year) }))]}
        />
        <Select
          label="Medium"
          value={value.medium ?? ""}
          onChange={(event) =>
            update({ medium: event.target.value ? event.target.value : null })
          }
          options={[{ label: "All", value: "" }, ...media.map((mediumOption) => ({ label: mediumOption, value: mediumOption }))]}
        />
        <Select
          label="Color"
          value={value.color ?? ""}
          onChange={(event) =>
            update({ color: event.target.value ? event.target.value : null })
          }
          options={[{ label: "All", value: "" }, ...colors.map((colorOption) => ({ label: colorOption, value: colorOption }))]}
        />
        <Select
          label="Sort"
          value={value.sort}
          onChange={(event) => update({ sort: event.target.value as PaintingSort })}
          options={[
            { label: "Newest", value: "newest" },
            { label: "Most viewed", value: "viewed" },
            { label: "Featured", value: "featured" }
          ]}
        />
      </div>
    </section>
  );
}

type SelectProps = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

function Select({ label, value, options, onChange }: SelectProps) {
  const id = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-xs uppercase tracking-[0.32em] text-muted/60">
      {label}
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full rounded-full border border-white/10 bg-[#141020] px-4 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          {options.map((option) => (
            <option key={option.value ?? option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">⌄</span>
      </span>
    </label>
  );
}
