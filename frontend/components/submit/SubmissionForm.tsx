'use client';

import { useState } from "react";
import { submitWriting } from "@/lib/api";

export function SubmissionForm() {
  const [form, setForm] = useState({ name: "", email: "", title: "", content: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.title || !form.content) {
      setError("Please fill all fields.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      await submitWriting(form);
      setStatus("success");
      setForm({ name: "", email: "", title: "", content: "" });
    } catch (err: any) {
      setError(err?.message || "Submission failed.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-semibold text-ink mb-4">Send Your Writing</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-muted space-y-2">
            Name
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              required
            />
          </label>
          <label className="text-sm text-muted space-y-2">
            Email
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
              required
            />
          </label>
        </div>
        <label className="text-sm text-muted space-y-2">
          Title
          <input
            type="text"
            value={form.title}
            onChange={handleChange("title")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            required
          />
        </label>
        <label className="text-sm text-muted space-y-2">
          Your Writing
          <textarea
            value={form.content}
            onChange={handleChange("content")}
            rows={6}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/60"
            required
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {status === "success" && <p className="text-sm text-green-400">Thanks! We received your submission.</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full px-5 py-2.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[var(--bg)] font-semibold shadow-[0_15px_40px_rgba(203,59,145,0.35)] disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
