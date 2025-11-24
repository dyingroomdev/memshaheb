"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BlogSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params?.get("q") ?? "";
  const [value, setValue] = useState(initial);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    const next = new URLSearchParams(params?.toString());
    if (query) {
      next.set("q", query);
    } else {
      next.delete("q");
    }
    const queryString = next.toString();
    const target = (queryString ? `/blogs?${queryString}` : "/blogs") as Route;
    router.push(target);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3 rounded-full border border-white/10 bg-card/70 px-4 py-2 shadow-glow-soft">
      <label htmlFor="blog-search" className="sr-only">
        Search stories
      </label>
      <input
        id="blog-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search stories…"
        className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted/60 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full border border-accent/40 bg-accent/20 px-4 py-1 text-xs font-medium text-accent transition hover:border-accent hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        Search
      </button>
    </form>
  );
}
