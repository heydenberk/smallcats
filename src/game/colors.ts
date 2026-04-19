const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};

export const hslToHex = (h: number, s: number, l: number): string => {
    const hNorm = (((h % 360) + 360) % 360) / 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, hNorm + 1 / 3);
    const g = hue2rgb(p, q, hNorm);
    const b = hue2rgb(p, q, hNorm - 1 / 3);
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const getColors = (
    count: number,
    startAngle = Math.floor(Math.random() * 360),
): string[] => {
    const step = 360 / count;
    return Array.from({ length: count }, (_, i) => hslToHex(startAngle + i * step, 0.75, 0.5));
};

export const patternIdFor = (color: string): string =>
    `color-${color.replace(/[^a-zA-Z0-9]/g, "")}-pattern`;
