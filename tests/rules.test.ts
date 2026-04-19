import { describe, expect, it } from "vitest";
import type { Card, CardSymbol, Shading } from "../src/game/types";
import { combinations, findSet, hasSet, isSet } from "../src/game/rules";
import { createDeck } from "../src/game/deck";

const card = (
    count: number,
    color: string,
    symbol: CardSymbol,
    shading: Shading,
): Card => ({ count, color, symbol, shading });

describe("isSet", () => {
    it("accepts all-same triple", () => {
        expect(
            isSet([
                card(1, "a", "circle", "open"),
                card(1, "a", "circle", "open"),
                card(1, "a", "circle", "open"),
            ]),
        ).toBe(true);
    });

    it("accepts all-different triple", () => {
        expect(
            isSet([
                card(1, "a", "circle", "open"),
                card(2, "b", "square", "shaded"),
                card(3, "c", "triangle", "colored"),
            ]),
        ).toBe(true);
    });

    it("rejects two-one on any attribute", () => {
        expect(
            isSet([
                card(1, "a", "circle", "open"),
                card(1, "a", "circle", "shaded"),
                card(1, "a", "circle", "colored"),
            ]),
        ).toBe(true); // all attrs all-diff-or-all-same (3 shadings all diff)

        expect(
            isSet([
                card(1, "a", "circle", "open"),
                card(1, "a", "circle", "open"),
                card(1, "a", "circle", "shaded"),
            ]),
        ).toBe(false); // shading has 2-open, 1-shaded

        expect(
            isSet([
                card(1, "a", "circle", "open"),
                card(2, "a", "square", "shaded"),
                card(3, "a", "triangle", "colored"),
            ]),
        ).toBe(true); // color all-same, others all-diff
    });
});

describe("combinations", () => {
    it("length === C(n,k)", () => {
        expect(combinations([1, 2, 3, 4], 2).length).toBe(6);
        expect(combinations([1, 2, 3, 4, 5], 3).length).toBe(10);
        expect(combinations([1, 2, 3], 3).length).toBe(1);
    });
    it("k=0 gives [[]]", () => {
        expect(combinations([1, 2, 3], 0)).toEqual([[]]);
    });
    it("k>n gives []", () => {
        expect(combinations([1, 2], 3)).toEqual([]);
    });
});

describe("hasSet vs oracle", () => {
    const oracleIsSet = (cards: Card[]): boolean => {
        const attrs: ((c: Card) => unknown)[] = [
            (c) => c.count,
            (c) => c.color,
            (c) => c.symbol,
            (c) => c.shading,
        ];
        for (const get of attrs) {
            const d = new Set(cards.map(get)).size;
            if (d !== 1 && d !== 3) return false;
        }
        return true;
    };
    const oracleHasSet = (stack: Card[]) =>
        combinations(stack, 3).some(oracleIsSet);

    it("matches oracle across 500 random 12-stacks", () => {
        const counts = [1, 2, 3];
        const colors = ["c1", "c2", "c3"];
        const symbols: CardSymbol[] = ["circle", "square", "triangle"];
        const shadings: Shading[] = ["colored", "open", "shaded"];

        let mismatches = 0;
        for (let t = 0; t < 500; t++) {
            const deck = createDeck(counts, colors, symbols, shadings);
            const stack = deck.slice(0, 12);
            if (hasSet(stack, 3) !== oracleHasSet(stack)) mismatches++;
        }
        expect(mismatches).toBe(0);
    });
});

describe("findSet", () => {
    it("returns a valid set when one exists", () => {
        const stack: Card[] = [
            card(1, "a", "circle", "open"),
            card(2, "b", "square", "shaded"),
            card(3, "c", "triangle", "colored"),
            card(1, "a", "circle", "shaded"),
        ];
        const set = findSet(stack, 3);
        expect(set).not.toBeNull();
        expect(isSet(set!)).toBe(true);
    });

    it("returns null when no set exists", () => {
        // Construct a deliberately set-less stack: 3 cards with a single 2-1 disagreement.
        const stack: Card[] = [
            card(1, "a", "circle", "open"),
            card(1, "a", "circle", "shaded"),
            card(2, "a", "circle", "open"),
        ];
        expect(findSet(stack, 3)).toBeNull();
    });
});
