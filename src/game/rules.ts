import type { Card } from "./types";

export const combinations = <T>(arr: T[], k: number): T[][] => {
    if (k === 0) return [[]];
    if (k > arr.length) return [];
    const out: T[][] = [];
    for (let i = 0; i <= arr.length - k; i++) {
        for (const tail of combinations(arr.slice(i + 1), k - 1)) {
            out.push([arr[i], ...tail]);
        }
    }
    return out;
};

const distinctCount = <T>(values: T[]): number => new Set(values).size;

export const isSet = (cards: Card[]): boolean => {
    if (cards.length < 2) return false;
    const attrs: ((c: Card) => Card[keyof Card])[] = [
        (c) => c.count,
        (c) => c.color,
        (c) => c.symbol,
        (c) => c.shading,
    ];
    for (const get of attrs) {
        const d = distinctCount(cards.map(get));
        if (d !== 1 && d !== cards.length) return false;
    }
    return true;
};

export const findSet = (stack: Card[], k: number): Card[] | null => {
    for (const combo of combinations(stack, k)) {
        if (isSet(combo)) return combo;
    }
    return null;
};

export const hasSet = (stack: Card[], k: number): boolean => findSet(stack, k) !== null;
