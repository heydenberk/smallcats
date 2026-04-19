export const CARD_PADDING = 10;

export interface CardSize {
    width: number;
    height: number;
}

export const computeCardSize = (
    viewportWidth: number,
    viewportHeight: number,
    columns: number,
    stackLength: number,
): CardSize => {
    const rows = Math.ceil(stackLength / columns);
    const xPadding = CARD_PADDING * (columns - 1);
    const yPadding = CARD_PADDING * (rows - 1);
    const yOffset = Math.pow(rows - 4, 0.9) * 16;
    const availWidth = viewportWidth / columns - xPadding;
    const availHeight = viewportHeight / rows - yPadding + yOffset;
    return {
        width: Math.min(240, availWidth),
        height: Math.min(availWidth * 0.8, 180, availHeight),
    };
};

export const computeShapeSize = ({ width, height }: CardSize): number =>
    Math.min(width / 4, height / 2);

export const gridPosition = (index: number, columns: number): [number, number] => [
    index % columns,
    Math.floor(index / columns),
];
