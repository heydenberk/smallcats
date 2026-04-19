import { useEffect } from "react";
import type { Action, GameState } from "../game/types";

const pad = (n: number): string => String(n).padStart(2, "0");

const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    const secs = seconds % 60;
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
};

interface Props {
    state: GameState;
    dispatch: (action: Action) => void;
}

export const Controls = ({ state, dispatch }: Props) => {
    const remaining =
        state.deck.length - state.deckIndex + state.stack.length;

    useEffect(() => {
        if (!state.hintMsg) return;
        const timeout = setTimeout(
            () => dispatch({ type: "clearHintMsg", id: state.hintMsgId }),
            1500,
        );
        return () => clearTimeout(timeout);
    }, [state.hintMsg, state.hintMsgId, dispatch]);

    const timerText = state.ended
        ? `Final time: ${formatTime(state.time)}`
        : formatTime(state.time);
    const scoreText = state.ended
        ? `Final score: ${state.score} points`
        : `${state.score} points`;

    return (
        <div id="controls">
            <span id="timer">{timerText}</span>
            <button
                id="pause-game"
                type="button"
                aria-label="Pause"
                onClick={() => dispatch({ type: "togglePause" })}
                disabled={state.ended}
            >
                {state.paused ? "▶" : "||"}
            </button>
            <button
                id="hint"
                type="button"
                aria-label="Hint"
                onClick={() => dispatch({ type: "hint" })}
                disabled={state.paused || state.ended}
            >
                ?
            </button>
            <span id="cards-remaining">
                {remaining}/{state.deck.length}
            </span>
            <span id="score">{scoreText}</span>
            <span id="hint-msg" className={state.hintMsg ? "visible" : ""}>
                {state.hintMsg}
            </span>
        </div>
    );
};
