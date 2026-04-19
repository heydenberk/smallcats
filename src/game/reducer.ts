import type { Action, Config, GameState, CardSymbol, Shading } from "./types";
import { ALL_SHADINGS, ALL_SYMBOLS } from "./types";
import { createDeck, shuffle } from "./deck";
import { getColors } from "./colors";
import { findSet, hasSet, isSet } from "./rules";

const DIMENSIONS = 3;

const timeBonus = (state: GameState): number => {
    const elapsed = Math.max(0, 100 - state.time + state.lastTime);
    return Math.round(Math.sqrt(elapsed));
};

// Pull `columns` cards at a time from the deck until a set exists or deck exhausted.
const withEnsuredSet = (state: GameState): GameState => {
    let { stack, deckIndex } = state;
    const { deck, config } = state;
    while (!hasSet(stack, config.columns) && deckIndex < deck.length) {
        stack = stack.concat(deck.slice(deckIndex, deckIndex + config.columns));
        deckIndex += config.columns;
    }
    return { ...state, stack, deckIndex };
};

const withRefill = (state: GameState): GameState => {
    const { config, deck, stack, deckIndex } = state;
    const deficit = config.stackSize - stack.length;
    const available = deck.length - deckIndex;
    if (deficit > 0 && available > 0) {
        const take = Math.min(deficit, available);
        return withEnsuredSet({
            ...state,
            stack: stack.concat(deck.slice(deckIndex, deckIndex + take)),
            deckIndex: deckIndex + take,
        });
    }
    return withEnsuredSet(state);
};

export const initialState = (): GameState => {
    const counts = Array.from({ length: DIMENSIONS }, (_, i) => i + 1);
    const symbols = shuffle(ALL_SYMBOLS).slice(0, DIMENSIONS) as CardSymbol[];
    const shadings = shuffle(ALL_SHADINGS).slice(0, DIMENSIONS) as Shading[];
    const colors = getColors(DIMENSIONS);
    const columns = counts.length;
    const stackSize = columns * (columns + 1);
    const config: Config = { counts, colors, symbols, shadings, columns, stackSize };
    const deck = createDeck(counts, colors, symbols, shadings);

    const base: GameState = {
        config,
        deck,
        deckIndex: 0,
        stack: [],
        selection: [],
        score: 0,
        time: 0,
        lastTime: 0,
        paused: false,
        ended: false,
        flash: null,
        pendingDiscard: null,
        hintMsg: "",
        hintMsgId: 0,
    };
    // Deal the initial stack, then auto-expand until a set exists.
    return withEnsuredSet({
        ...base,
        stack: deck.slice(0, stackSize),
        deckIndex: stackSize,
    });
};

let flashId = 0;
const nextFlashId = () => ++flashId;

export const reducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case "tick":
            if (state.paused || state.ended) return state;
            return { ...state, time: state.time + 1 };

        case "togglePause":
            if (state.ended) return state;
            return { ...state, paused: !state.paused };

        case "toggleSelect": {
            if (state.paused || state.ended || state.pendingDiscard) return state;
            const already = state.selection.includes(action.card);
            const selection = already
                ? state.selection.filter((c) => c !== action.card)
                : [...state.selection, action.card];

            if (selection.length < state.config.columns) {
                return { ...state, selection };
            }

            // Completed selection: score immediately, defer stack mutation until flash clears
            // so the cards are visible during the flash animation.
            const valid = isSet(selection);
            if (valid) {
                return {
                    ...state,
                    score: state.score + 10 + timeBonus(state),
                    lastTime: state.time,
                    selection: [],
                    flash: { kind: "valid", cards: selection, id: nextFlashId() },
                    pendingDiscard: selection,
                };
            }
            return {
                ...state,
                score: state.score - 1,
                selection: [],
                flash: { kind: "invalid", cards: selection, id: nextFlashId() },
            };
        }

        case "hint": {
            if (state.paused || state.ended || state.pendingDiscard) return state;
            const set = findSet(state.stack, state.config.columns);
            if (set) {
                return { ...state, flash: { kind: "hint", cards: set, id: nextFlashId() } };
            }
            return { ...state, hintMsg: "no sets", hintMsgId: nextFlashId() };
        }

        case "clearFlash": {
            if (!state.flash || state.flash.id !== action.id) return state;
            if (state.pendingDiscard) {
                const discard = state.pendingDiscard;
                const stack = state.stack.filter((c) => !discard.includes(c));
                const refilled = withRefill({
                    ...state,
                    stack,
                    flash: null,
                    pendingDiscard: null,
                });
                const ended = !hasSet(refilled.stack, state.config.columns);
                return { ...refilled, ended };
            }
            return { ...state, flash: null };
        }

        case "clearHintMsg":
            if (state.hintMsgId === action.id) {
                return { ...state, hintMsg: "" };
            }
            return state;
    }
};
