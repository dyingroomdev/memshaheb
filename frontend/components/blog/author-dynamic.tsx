'use client';

import { useEffect, useState } from "react";
import { getCurrentUser, type User, getSiteSettings } from "@/lib/api";
import { AuthorTeaser } from "./author-teaser";

type AuthorDynamicProps = {
  fallbackName: string;
  fallbackBio: string;
};

export function AuthorTeaserDynamic({ fallbackName, fallbackBio }: AuthorDynamicProps) {
  const [author, setAuthor] = useState<{ name: string; bio: string; avatarUrl?: string | null }>({
    name: fallbackName,
    bio: fallbackBio
  });

  useEffect(() => {
    const load = async () => {
      try {
        const me: User | null = await getCurrentUser();
        if (me?.display_name || me?.bio) {
          setAuthor({
            name: me.display_name || fallbackName,
            bio: me.bio || fallbackBio
          });
          return;
        }
        // As a softer fallback, try site settings tagline as bio if available
        const settings = await getSiteSettings();
        if (settings?.site_tagline) {
          setAuthor((prev) => ({ ...prev, bio: settings.site_tagline! }));
        }
      } catch {
        // ignore and keep fallback
      }
    };
    load();
  }, [fallbackBio, fallbackName]);

  return <AuthorTeaser name={author.name} bio={author.bio} avatarUrl={author.avatarUrl} />;
}
