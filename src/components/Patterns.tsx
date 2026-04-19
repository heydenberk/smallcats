import { patternIdFor } from "../game/colors";

interface Props {
    colors: string[];
}

export const Patterns = ({ colors }: Props) => (
    <>
        {colors.map((color) => (
            <pattern
                key={color}
                id={patternIdFor(color)}
                patternUnits="userSpaceOnUse"
                width={9}
                height={9}
            >
                <path stroke={color} strokeWidth={4} d="M0,4 L9,4" />
            </pattern>
        ))}
    </>
);
