import { useEffect, useState, type ReactElement } from "react";

type Pictures = Record<string, ReactElement>;

let pictures: Pictures | undefined;
let loading: Promise<Pictures> | undefined;

// The drawings live in their own chunk so they never weigh on the eager study bundle.
// A failed load (offline before the chunk was cached) is forgotten so a later card retries.
export function loadCardPictures(): Promise<Pictures> {
  loading ??= import("./cardPictures").then(
    (module) => (pictures = module.cardPictures),
    (error: unknown) => {
      loading = undefined;
      throw error;
    },
  );
  return loading;
}

// Simple drawings of what a card's word means, so visual learners can anchor the word
// to an image. The answer text already states the meaning, so screen readers skip the
// drawing instead of hearing it twice.
export function CardPicture({ cardId }: { cardId: string }) {
  const [loaded, setLoaded] = useState(pictures);

  useEffect(() => {
    if (loaded) return;
    let active = true;
    loadCardPictures().then(
      (result) => active && setLoaded(result),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [loaded]);

  const picture = loaded?.[cardId];
  if (!picture) return null;
  return (
    <svg className="card-picture" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      {picture}
    </svg>
  );
}
