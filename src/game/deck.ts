import type { Card, CardSymbol, Shading } from "./types";

export const shuffle = <T>(arr: readonly T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

export const createDeck = (
    counts: number[],
    colors: string[],
    symbols: CardSymbol[],
    shadings: Shading[],
): Card[] => {
    const deck: Card[] = [];
    for (const count of counts) {
        for (const color of colors) {
            for (const symbol of symbols) {
                for (const shading of shadings) {
                    deck.push({ count, color, symbol, shading });
                }
            }
        }
    }
    return shuffle(deck);
};
