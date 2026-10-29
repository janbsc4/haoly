import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CardPicture } from "../src/components/CardPicture";
import { cardPictures } from "../src/components/cardPictures";
import { loadFlashcards } from "../src/data/loadFlashcards";

describe("card pictures", () => {
  it("draws only existing translation cards, never concept cards", () => {
    const cards = new Map(loadFlashcards().map((card) => [card.id, card]));
    for (const id of Object.keys(cardPictures)) {
      expect(cards.has(id), `${id} must be an existing card`).toBe(true);
      expect(cards.get(id)?.tipo, `${id} tests a rule, not a word to picture`).not.toBe("concepto");
    }
  });

  it("styles every picture class in global.css", () => {
    const css = readFileSync("src/styles/global.css", "utf8");
    const markup = Object.values(cardPictures)
      .map((picture) => renderToStaticMarkup(picture))
      .join("");
    const classes = new Set([...markup.matchAll(/class="([^"]+)"/g)].flatMap((match) => match[1].split(" ")));
    for (const className of classes) {
      expect(css, `.${className} needs a rule`).toContain(`.card-picture .${className} {`);
    }
  });

  it("shows the bubble tea drawing on its card and nothing on cards without one", async () => {
    const { container, rerender } = render(<CardPicture cardId="FC127" />);
    await expect.poll(() => container.querySelector("svg.card-picture")).not.toBeNull();
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");

    rerender(<CardPicture cardId="FC001" />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
