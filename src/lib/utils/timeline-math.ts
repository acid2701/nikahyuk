export interface TimelineItemMath {
  id: string;
  timeStart: string;
  timeEnd: string;
  orderIndex: number;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function calculateTimelineShift<T extends TimelineItemMath>(
  items: T[],
  startIndex: number,
  deltaMinutes: number
): T[] {
  if (startIndex < 0 || startIndex >= items.length || deltaMinutes === 0) {
    return items;
  }

  return items.map((item, idx) => {
    if (idx < startIndex) {
      return item;
    }

    const startMins = parseTimeToMinutes(item.timeStart);
    const endMins = parseTimeToMinutes(item.timeEnd);
    const duration = endMins >= startMins ? endMins - startMins : 30;

    const newStartMins = startMins + deltaMinutes;
    const newEndMins = newStartMins + duration;

    return {
      ...item,
      timeStart: formatMinutesToTime(newStartMins),
      timeEnd: formatMinutesToTime(newEndMins),
    };
  });
}
