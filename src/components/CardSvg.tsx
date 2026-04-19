import type { Card } from "../game/types";
import { CARD_PADDING, type CardSize } from "../game/layout";
import { patternIdFor } from "../game/colors";

const FILL_OPACITY: Record<Card["shading"], number> = {
    open: 0,
    shaded: 0.25,
    colored: 1,
    striped: 1,
};

const fillFor = (card: Card): string =>
    card.shading === "striped" ? `url(#${patternIdFor(card.color)})` : card.color;

interface ShapeRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
    radius: number;
}

const shapeRect = (centroid: [number, number], shapeSize: number): ShapeRect => {
    const radius = shapeSize / 2;
    return {
        radius,
        left: centroid[0] - radius,
        right: centroid[0] + radius,
        top: centroid[1] - radius,
        bottom: centroid[1] + radius,
    };
};

interface ShapeProps {
    card: Card;
    centroid: [number, number];
    shapeSize: number;
}

const Shape = ({ card, centroid, shapeSize }: ShapeProps) => {
    const fill = fillFor(card);
    const common = {
        className: "symbol",
        fill,
        fillOpacity: FILL_OPACITY[card.shading],
        stroke: card.color,
    };
    const rect = shapeRect(centroid, shapeSize);
    if (card.symbol === "circle") {
        return <circle {...common} cx={centroid[0]} cy={centroid[1]} r={rect.radius} />;
    }
    if (card.symbol === "square") {
        return (
            <rect
                {...common}
                x={rect.left}
                y={rect.top}
                width={rect.right - rect.left}
                height={rect.bottom - rect.top}
            />
        );
    }
    if (card.symbol === "triangle") {
        const points = [
            [centroid[0], rect.top],
            [rect.left, rect.bottom],
            [rect.right, rect.bottom],
        ]
            .map((p) => p.join(","))
            .join(" ");
        return <polygon {...common} points={points} />;
    }
    // diamond
    const points = [
        [centroid[0], rect.top],
        [rect.left, centroid[1]],
        [centroid[0], rect.bottom],
        [rect.right, centroid[1]],
    ]
        .map((p) => p.join(","))
        .join(" ");
    return <polygon {...common} points={points} />;
};

interface Props {
    card: Card;
    size: CardSize;
    shapeSize: number;
    translate: [number, number];
    selected: boolean;
    strokeOverride: string | null;
    symbolsVisible: boolean;
    onClick: () => void;
}

export const CardSvg = ({
    card,
    size,
    shapeSize,
    translate,
    selected,
    strokeOverride,
    symbolsVisible,
    onClick,
}: Props) => {
    const p = CARD_PADDING;
    const hp = p / 2;
    const effectiveShapeSize = shapeSize - CARD_PADDING;
    const cx = size.width / 2;
    const cy = size.height / 2;
    const start = (card.count - 1) * -0.6;
    const end = (card.count + 1) * 0.6;
    const centroids: [number, number][] = [];
    for (let dx = start; dx < end; dx += 1.2) {
        centroids.push([cx + effectiveShapeSize * dx, cy]);
    }

    const stroke = strokeOverride ?? (selected ? "black" : "transparent");
    const cardClass = `card${selected ? " selected" : ""}`;

    return (
        <g transform={`translate(${translate[0]}, ${translate[1]})`} onClick={onClick}>
            <rect
                className={cardClass}
                x={hp}
                y={hp}
                rx={p}
                ry={p}
                width={size.width - p}
                height={size.height - p}
                stroke={stroke}
            />
            {symbolsVisible &&
                centroids.map((c, i) => (
                    <Shape key={i} card={card} centroid={c} shapeSize={effectiveShapeSize} />
                ))}
        </g>
    );
};
