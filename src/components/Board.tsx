import { useEffect } from "react";
import type { Action, Card, FlashKind, GameState } from "../game/types";
import { computeCardSize, computeShapeSize, gridPosition } from "../game/layout";
import { useWindowSize } from "../hooks/useWindowSize";
import { Patterns } from "./Patterns";
import { CardSvg } from "./CardSvg";

const FLASH_DURATION_MS: Record<FlashKind, number> = {
    valid: 1000,
    invalid: 1000,
    hint: 1200,
};

const STROKE_FOR_FLASH: Record<FlashKind, string> = {
    valid: "lightgreen",
    invalid: "red",
    hint: "gold",
};

interface Props {
    state: GameState;
    dispatch: (action: Action) => void;
}

export const Board = ({ state, dispatch }: Props) => {
    const windowSize = useWindowSize();
    const size = computeCardSize(
        windowSize.width,
        windowSize.height,
        state.config.columns,
        state.stack.length,
    );
    const shapeSize = computeShapeSize(size);

    const { flash } = state;
    useEffect(() => {
        if (!flash) return;
        const timeout = setTimeout(
            () => dispatch({ type: "clearFlash", id: flash.id }),
            FLASH_DURATION_MS[flash.kind],
        );
        return () => clearTimeout(timeout);
    }, [flash, dispatch]);

    const strokeFor = (card: Card): string | null => {
        if (!flash) return null;
        return flash.cards.includes(card) ? STROKE_FOR_FLASH[flash.kind] : null;
    };

    const symbolsVisible = !state.paused;

    const rows = Math.ceil(state.stack.length / state.config.columns);
    const svgHeight = rows * size.height;
    const svgWidth = state.config.columns * size.width;

    return (
        <svg
            id="game-cards"
            className={`playing${state.paused ? " paused" : ""}`}
            width={svgWidth}
            height={svgHeight}
        >
            <filter id="dropshadow" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0" />
                <feOffset dx="2" dy="2" result="offsetblur" />
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <defs>
                <Patterns colors={state.config.colors} />
            </defs>
            {state.stack.map((card, i) => {
                const [col, row] = gridPosition(i, state.config.columns);
                const selected = state.selection.includes(card);
                return (
                    <CardSvg
                        key={`${card.count}-${card.color}-${card.symbol}-${card.shading}`}
                        card={card}
                        size={size}
                        shapeSize={shapeSize}
                        translate={[col * size.width, row * size.height]}
                        selected={selected}
                        strokeOverride={strokeFor(card)}
                        symbolsVisible={symbolsVisible}
                        onClick={() => dispatch({ type: "toggleSelect", card })}
                    />
                );
            })}
        </svg>
    );
};
