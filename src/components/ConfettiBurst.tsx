import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

const COLORS = [
  "#ff595e",
  "#ffca3a",
  "#8ac926",
  "#1982c4",
  "#6a4c93",
  "#00f5d4",
  "#f15bb5",
  "#9b5de5",
  "#fee440",
  "#00bbf9",
];

type PieceConfig = {
  endX: number;
  endY: number;
  color: string;
  width: number;
  height: number;
  rotateDeg: number;
  duration: number;
  borderRadius: number;
};

function generatePieces(count: number, screenW: number): PieceConfig[] {
  const pieces: PieceConfig[] = [];
  const maxRadius = screenW * 0.55;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const radius = maxRadius * 0.4 + Math.random() * maxRadius * 0.6;
    pieces.push({
      endX: Math.cos(angle) * radius,
      endY: Math.sin(angle) * radius,
      color: COLORS[i % COLORS.length],
      width: 5 + Math.random() * 9,
      height: 7 + Math.random() * 15,
      rotateDeg: (Math.random() - 0.5) * 900,
      duration: 900 + Math.random() * 500,
      borderRadius: Math.random() > 0.5 ? 100 : 2,
    });
  }
  return pieces;
}

type ConfettiBurstProps = {
  particleCount?: number;
};

export function ConfettiBurst({ particleCount = 60 }: ConfettiBurstProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const piecesRef = useRef<PieceConfig[]>(
    generatePieces(particleCount, screenW),
  );
  const animValues = useRef(
    piecesRef.current.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const pieces = piecesRef.current;
    const animations = animValues.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: pieces[i].duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    const composite = Animated.parallel(animations);
    composite.start();

    return () => {
      composite.stop();
      animValues.forEach((v) => v.setValue(0));
    };
  }, [animValues]);

  const pieces = piecesRef.current;
  const cx = screenW / 2;
  const cy = screenH * 0.38;

  return (
    <View pointerEvents="none" style={styles.canvas}>
      {pieces.map((piece, i) => {
        const progress = animValues[i];

        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, piece.endX],
        });

        const translateY = progress.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [0, piece.endY * 0.8, piece.endY + 40],
        });

        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${piece.rotateDeg}deg`],
        });

        const scaleY = progress.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [1, 0.3, 1, 0.4, 0.2],
        });

        const scale = progress.interpolate({
          inputRange: [0, 0.1, 0.5, 1],
          outputRange: [0, 1.2, 1, 0.6],
        });

        const opacity = progress.interpolate({
          inputRange: [0, 0.05, 0.6, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={`c-${i}`}
            style={[
              styles.particle,
              {
                backgroundColor: piece.color,
                borderRadius: piece.borderRadius,
                height: piece.height,
                left: cx,
                opacity,
                top: cy,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                  { scale },
                  { scaleY },
                ],
                width: piece.width,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
  },
  particle: {
    position: "absolute",
  },
});
