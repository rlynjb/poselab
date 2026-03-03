"use client";

interface VelocitySparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export default function VelocitySparkline({
  values,
  width = 200,
  height = 40,
}: VelocitySparklineProps) {
  const max = Math.max(...values, 0.01);
  const barCount = values.length;
  if (barCount === 0) return null;

  const barWidth = width / 30; // always sized for 30 bars
  const threshold = max * 0.7;

  return (
    <svg
      width={width}
      height={height}
      className="block"
      viewBox={`0 0 ${width} ${height}`}
    >
      {values.map((v, i) => {
        const barHeight = Math.max((v / max) * height, 1);
        const isHigh = v > threshold;
        return (
          <rect
            key={i}
            x={i * barWidth}
            y={height - barHeight}
            width={barWidth - 1}
            height={barHeight}
            rx={1}
            fill={isHigh ? "#ff6b9d" : "#00e5a0"}
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}
