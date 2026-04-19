export type Shading = "colored" | "open" | "shaded" | "striped";
export type CardSymbol = "circle" | "square" | "triangle" | "diamond";

export const ALL_SHADINGS: Shading[] = ["colored", "open", "shaded", "striped"];
export const ALL_SYMBOLS: CardSymbol[] = ["circle", "square", "triangle", "diamond"];

export interface Card {
    count: number;
    color: string;
    symbol: CardSymbol;
    shading: Shading;
}

export interface Config {
    counts: number[];
    colors: string[];
    symbols: CardSymbol[];
    shadings: Shading[];
    columns: number;
    stackSize: number;
}

export type FlashKind = "valid" | "invalid" | "hint";

export interface Flash {
    kind: FlashKind;
    cards: Card[];
    id: number;
}

export interface GameState {
    config: Config;
    deck: Card[];
    deckIndex: number;
    stack: Card[];
    selection: Card[];
    score: number;
    time: number;
    lastTime: number;
    paused: boolean;
    ended: boolean;
    flash: Flash | null;
    pendingDiscard: Card[] | null;
    hintMsg: string;
    hintMsgId: number;
}

export type Action =
    | { type: "tick" }
    | { type: "togglePause" }
    | { type: "toggleSelect"; card: Card }
    | { type: "hint" }
    | { type: "clearFlash"; id: number }
    | { type: "clearHintMsg"; id: number };
