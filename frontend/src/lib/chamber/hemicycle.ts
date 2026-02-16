export interface SeatPosition {
  index: number;
  row: number;
  col: number;
  x: number;
  y: number;
  angle: number;
}

export interface HemicycleConfig {
  totalSeats: number;
  rows: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}

export const DEFAULT_HEMICYCLE_CONFIG: HemicycleConfig = {
  totalSeats: 300,
  rows: 17,
  centerX: 500,
  centerY: 580,
  innerRadius: 150,
  outerRadius: 540,
  startAngle: Math.PI,
  endAngle: 0,
};

export function generateHemicycleLayout(
  config: HemicycleConfig = DEFAULT_HEMICYCLE_CONFIG,
): SeatPosition[] {
  const { totalSeats, rows, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle } =
    config;

  const rowRadii: number[] = [];
  for (let r = 0; r < rows; r++) {
    rowRadii.push(innerRadius + (outerRadius - innerRadius) * (r / (rows - 1)));
  }

  // Distribute seats proportional to arc length (radius)
  const totalArcLength = rowRadii.reduce((sum, r) => sum + r, 0);
  const seatsPerRow: number[] = rowRadii.map((r) => Math.round((r / totalArcLength) * totalSeats));

  // Adjust to match exact total
  let diff = totalSeats - seatsPerRow.reduce((a, b) => a + b, 0);
  let adjustIdx = Math.floor(rows / 2);
  while (diff !== 0) {
    seatsPerRow[adjustIdx] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    adjustIdx = (adjustIdx + 1) % rows;
  }

  const seats: SeatPosition[] = [];
  let globalIndex = 0;
  const padding = 0.03;

  for (let r = 0; r < rows; r++) {
    const radius = rowRadii[r];
    const count = seatsPerRow[r];

    for (let c = 0; c < count; c++) {
      const t = count === 1 ? 0.5 : c / (count - 1);
      const angle = startAngle + (endAngle - startAngle) * (padding + t * (1 - 2 * padding));

      seats.push({
        index: globalIndex++,
        row: r,
        col: c,
        x: centerX + radius * Math.cos(angle),
        y: centerY - radius * Math.sin(angle),
        angle,
      });
    }
  }

  return seats;
}
