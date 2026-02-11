import { useWindowDimensions } from 'react-native';

const BASE_HEIGHT = 812; // Standard iPhone size
const BASE_WIDTH = 375;

export function useResponsive() {
    const { width, height } = useWindowDimensions();

    const isSmallDevice = height <= 700; // iPhone SE, 8, etc.
    const isLargeDevice = height > 900; // iPhone 14 Pro Max, etc.

    // Conservative vertical scaling
    const scaleHigh = height / BASE_HEIGHT;
    const scaleWide = width / BASE_WIDTH;

    // Helper to scale values conservatively
    // factor 0.5 means it only scales 50% of the ratio difference
    const scale = (size: number, factor = 0.5) => {
        return size + (size * (scaleHigh - 1) * factor);
    };

    // Height-aware scaling for spacing
    const spacing = (size: number) => {
        return Math.round(scale(size));
    };

    // Font helper
    const font = (size: number) => {
        // Fonts scaling based on height balances better on different aspect ratios
        return Math.round(scale(size, 0.4)); // Slightly less aggressive for fonts
    };

    const radius = (size: number) => {
        return Math.round(scale(size));
    };

    return {
        spacing,
        font,
        radius,
        isSmallDevice,
        isLargeDevice,
        dimensions: { width, height }
    };
}
