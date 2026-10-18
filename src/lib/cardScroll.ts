/** Gap kept between the viewport top and the card after scrolling to it. */
export const CARD_SCROLL_MARGIN = 12;

/**
 * How far to scroll so a card's top lands at the top of the viewport, or 0 when the
 * whole card is already visible. `visibleBottom` is the lowest viewport y not covered
 * by floating controls, so a card hidden behind the mobile action bar counts as cut off.
 */
export function cardScrollDelta(
  card: { top: number; bottom: number },
  visibleBottom: number,
  margin = CARD_SCROLL_MARGIN,
): number {
  if (card.top >= margin && card.bottom <= visibleBottom) return 0;
  return card.top - margin;
}
