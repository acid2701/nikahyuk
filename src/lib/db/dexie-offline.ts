import Dexie, { Table } from "dexie";

export interface OfflineCheckinItem {
  assignmentId: string;
  eventId: string;
  attendanceStatus: string;
  checkinTimestamp: string | null;
  souvenirReceived: boolean;
  synced: number; // 0 = false, 1 = true
  updatedAt: number;
}

export interface MutationQueueItem {
  id?: number;
  actionType: "CHECKIN" | "SOUVENIR" | "WALKIN";
  payload: any;
  timestamp: number;
}

export class NikahYukOfflineDB extends Dexie {
  checkins!: Table<OfflineCheckinItem, string>;
  mutationQueue!: Table<MutationQueueItem, number>;

  constructor() {
    super("NikahYukOfflineDB");
    this.version(1).stores({
      checkins: "assignmentId, eventId, attendanceStatus, synced, updatedAt",
      mutationQueue: "++id, actionType, timestamp",
    });
  }
}

export const offlineDB = new NikahYukOfflineDB();
