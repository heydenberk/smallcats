import { useEffect, useState } from "react";

export interface WindowSize {
    width: number;
    height: number;
}

const read = (): WindowSize => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
});

export const useWindowSize = (): WindowSize => {
    const [size, setSize] = useState<WindowSize>(read);
    useEffect(() => {
        const onResize = () => setSize(read());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return size;
};
