import { cardScrollDelta } from "../src/lib/cardScroll";

describe("cardScrollDelta", () => {
  it("leaves the page alone when the whole card is visible", () => {
    expect(cardScrollDelta({ top: 180, bottom: 600 }, 800, 12)).toBe(0);
  });

  it("scrolls down to the card top when the revealed answer runs past the viewport", () => {
    expect(cardScrollDelta({ top: 180, bottom: 1400 }, 800, 12)).toBe(168);
  });

  it("treats a card hidden behind the floating action bar as cut off", () => {
    expect(cardScrollDelta({ top: 180, bottom: 700 }, 650, 12)).toBe(168);
  });

  it("scrolls back up to the card top when the next card starts above the viewport", () => {
    expect(cardScrollDelta({ top: -400, bottom: 0 }, 800, 12)).toBe(-412);
  });

  it("stays put when a tall card is already aligned to the top", () => {
    expect(cardScrollDelta({ top: 12, bottom: 1400 }, 800, 12)).toBe(0);
  });
});
