import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateTimelineShift,
  TimelineItemMath,
} from "@/lib/utils/timeline-math";

describe("Timeline Math Unit Tests", () => {
  it("should parse HH:mm to minutes accurately", () => {
    expect(parseTimeToMinutes("08:00")).toBe(480);
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("12:15")).toBe(735);
  });

  it("should format minutes to HH:mm string accurately", () => {
    expect(formatMinutesToTime(480)).toBe("08:00");
    expect(formatMinutesToTime(570)).toBe("09:30");
    expect(formatMinutesToTime(1445)).toBe("00:05");
  });

  it("should shift timeline items from startIndex onwards by +15m", () => {
    const mockItems: TimelineItemMath[] = [
      { id: "1", timeStart: "08:00", timeEnd: "08:30", orderIndex: 0 },
      { id: "2", timeStart: "08:30", timeEnd: "09:00", orderIndex: 1 },
      { id: "3", timeStart: "09:00", timeEnd: "10:00", orderIndex: 2 },
    ];

    const shifted = calculateTimelineShift(mockItems, 1, 15);

    expect(shifted[0].timeStart).toBe("08:00");
    expect(shifted[0].timeEnd).toBe("08:30");

    expect(shifted[1].timeStart).toBe("08:45");
    expect(shifted[1].timeEnd).toBe("09:15");

    expect(shifted[2].timeStart).toBe("09:15");
    expect(shifted[2].timeEnd).toBe("10:15");
  });

  it("should advance timeline items by -10m without affecting prior items", () => {
    const mockItems: TimelineItemMath[] = [
      { id: "1", timeStart: "10:00", timeEnd: "10:30", orderIndex: 0 },
      { id: "2", timeStart: "10:30", timeEnd: "11:00", orderIndex: 1 },
    ];

    const shifted = calculateTimelineShift(mockItems, 1, -10);

    expect(shifted[0].timeStart).toBe("10:00");
    expect(shifted[1].timeStart).toBe("10:20");
    expect(shifted[1].timeEnd).toBe("10:50");
  });
});
