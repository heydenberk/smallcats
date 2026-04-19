import { useReducer } from "react";
import { initialState, reducer } from "./game/reducer";
import { useInterval } from "./hooks/useInterval";
import { Board } from "./components/Board";
import { Controls } from "./components/Controls";

export const App = () => {
    const [state, dispatch] = useReducer(reducer, undefined, initialState);
    const tickActive = !state.paused && !state.ended;
    useInterval(() => dispatch({ type: "tick" }), tickActive ? 1000 : null);

    return (
        <div id="container">
            <div id="game" className="enabled">
                <Board state={state} dispatch={dispatch} />
                <Controls state={state} dispatch={dispatch} />
            </div>
        </div>
    );
};
