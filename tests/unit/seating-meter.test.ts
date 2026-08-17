import { describe, it, expect } from "vitest";
import { evaluateSeatingCapacity } from "@/lib/utils/seating-meter";

describe("Seating Capacity Meter Evaluator", () => {
  it("should return normal green state when capacity is <= 80%", () => {
    const result = evaluateSeatingCapacity(8, 10);
    expect(result.ratio).toBe(80);
    expect(result.status).toBe("normal");
    expect(result.color).toBe("green");
  });

  it("should return warning amber state when capacity is between 81% and 100%", () => {
    const result = evaluateSeatingCapacity(9, 10);
    expect(result.ratio).toBe(90);
    expect(result.status).toBe("warning");
    expect(result.color).toBe("amber");
  });

  it("should return overbooked red state when capacity exceeds 100%", () => {
    const result = evaluateSeatingCapacity(12, 10);
    expect(result.ratio).toBe(120);
    expect(result.status).toBe("overbooked");
    expect(result.color).toBe("red");
  });

  it("should handle edge case when maxSeats is 0", () => {
    const result = evaluateSeatingCapacity(5, 0);
    expect(result.ratio).toBe(0);
    expect(result.status).toBe("normal");
  });
});
