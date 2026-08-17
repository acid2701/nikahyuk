export interface SeatingCapacityResult {
  ratio: number;
  status: "normal" | "warning" | "overbooked";
  color: "green" | "amber" | "red";
  badgeLabel: string;
}

export function evaluateSeatingCapacity(seatedPax: number, maxSeats: number): SeatingCapacityResult {
  if (maxSeats <= 0) {
    return { ratio: 0, status: "normal", color: "green", badgeLabel: "Kapasitas 0" };
  }

  const ratio = (seatedPax / maxSeats) * 100;

  if (ratio > 100) {
    return {
      ratio: Math.round(ratio),
      status: "overbooked",
      color: "red",
      badgeLabel: `Overbooked (${seatedPax}/${maxSeats} Pax)`,
    };
  }

  if (ratio > 80) {
    return {
      ratio: Math.round(ratio),
      status: "warning",
      color: "amber",
      badgeLabel: `Hampir Penuh (${seatedPax}/${maxSeats} Pax)`,
    };
  }

  return {
    ratio: Math.round(ratio),
    status: "normal",
    color: "green",
    badgeLabel: `Tersedia (${seatedPax}/${maxSeats} Pax)`,
  };
}
