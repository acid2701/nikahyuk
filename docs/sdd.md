# Software Design Document (SDD - Technical Specification)

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Core Framework:** Next.js 14+ (App Router, Server Actions, Route Handlers)  
**Type System:** TypeScript 5+ (Strict Mode)  
**Database & BaaS:** Supabase PostgreSQL 15+, GoTrue Auth, Realtime CDC  
**Storage & Media:** Cloudflare R2 (Dynamic S3 Client), `browser-image-compression`

---

## 1. System Design Principles & Dynamic Runtime Configuration

### 1.1 In-Memory Dynamic System Config Provider
Kredensial Cloudflare R2 dan aturan upload tidak dibaca langsung dari `process.env`, melainkan diambil dari tabel `system_settings` di PostgreSQL dan disimpan dalam memori (*cached*) dengan mekanisme revalidasi on-demand:

```typescript
// src/lib/cloudflare-r2/dynamic-config.ts
import { createServerActionClient } from '@/lib/supabase/server';
import { S3Client } from '@aws-sdk/client-s3';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicCdnDomain: string;
}

export interface StorageRules {
  maxImageSizeMb: number;
  maxPdfSizeMb: number;
  targetImageFormat: 'webp' | 'jpeg';
  imageQualityRatio: number;
  allowedMimeTypes: string[];
}

let cachedR2Config: R2Config | null = null;
let cachedS3Client: S3Client | null = null;
let cachedStorageRules: StorageRules | null = null;
let lastFetchedTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL fallback

export async function getDynamicR2Client(): Promise<{ s3: S3Client; config: R2Config }> {
  const now = Date.now();
  if (cachedS3Client && cachedR2Config && now - lastFetchedTimestamp < CACHE_TTL_MS) {
    return { s3: cachedS3Client, config: cachedR2Config };
  }

  const supabase = createServerActionClient();
  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', ['r2_credentials', 'storage_rules']);

  if (error || !data) {
    throw new Error('Gagal memuat konfigurasi sistem dinamis dari database.');
  }

  const r2Row = data.find((r) => r.key === 'r2_credentials');
  if (!r2Row || !r2Row.value) {
    throw new Error('Kredensial Cloudflare R2 belum dikonfigurasi di panel Superadmin.');
  }

  cachedR2Config = r2Row.value as R2Config;
  cachedS3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${cachedR2Config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cachedR2Config.accessKeyId,
      secretAccessKey: cachedR2Config.secretAccessKey,
    },
  });

  const storageRow = data.find((r) => r.key === 'storage_rules');
  if (storageRow) {
    cachedStorageRules = storageRow.value as StorageRules;
  }

  lastFetchedTimestamp = now;
  return { s3: cachedS3Client, config: cachedR2Config };
}

export function invalidateSystemConfigCache(): void {
  cachedR2Config = null;
  cachedS3Client = null;
  cachedStorageRules = null;
  lastFetchedTimestamp = 0;
}
2. Reusable Shared Component Interfaces2.1 <UniversalDataTable<T> /> (/components/shared/data-table/)TypeScript Interface:TypeScriptimport { ColumnDef } from '@tanstack/react-table';

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterableColumn {
  id: string;
  title: string;
  options: FilterOption[];
}

export interface UniversalDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterableColumns?: FilterableColumn[];
  enableInlineEditing?: boolean;
  onCellEditSubmit?: (rowId: string, columnId: string, value: unknown) => Promise<void>;
  isLoading?: boolean;
  emptyMessage?: string;
}
2.2 <MediaUploaderDropzone /> (/components/shared/media-uploader/)TypeScript Interface:TypeScriptexport interface UploadedFileMeta {
  r2_file_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
}

export interface MediaUploaderDropzoneProps {
  weddingId: string;
  folder: 'invoices' | 'contracts' | 'proofs';
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  onUploadSuccess: (meta: UploadedFileMeta) => void;
  onUploadError: (errorMessage: string) => void;
  isProcessing?: boolean;
}
2.3 <WhatsAppButton /> & <PhoneInput /> (/components/shared/whatsapp/)Sanitizer & URL Engine:TypeScriptexport function sanitizePhoneNumber(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly.startsWith('0')) {
    return '62' + digitsOnly.slice(1);
  }
  if (digitsOnly.startsWith('62')) {
    return digitsOnly;
  }
  return '62' + digitsOnly;
}

export function buildWhatsAppDirectLink(
  rawPhone: string,
  templateString: string,
  variables: Record<string, string>
): string {
  const sanitized = sanitizePhoneNumber(rawPhone);
  let resolvedText = templateString;

  for (const [key, value] of Object.entries(variables)) {
    resolvedText = resolvedText.replaceAll(`{${key}}`, value || '');
  }

  return `[https://wa.me/$](https://wa.me/$){sanitized}?text=${encodeURIComponent(resolvedText)}`;
}
3. Core Domain Algorithms & Mathematical Models3.1 Shift Timeline Engine (Dynamic Rundown Recalculation)Problem Formulation: Ketika suatu aktivitas pada nomor urut $k$ (sort_order = k) mengalami keterlambatan sebesar $\Delta t$ menit, seluruh aktivitas $i \ge k$ harus dimutasi waktunya sebesar $\Delta t$ tanpa mengubah durasi masing-masing aktivitas.TypeScriptexport interface RundownRow {
  id: string;
  sort_order: number;
  time_start: string; // Format "HH:mm"
  time_end: string;   // Format "HH:mm"
}

export function calculateTimelineShift(
  items: RundownRow[],
  targetSortOrder: number,
  shiftMinutes: number
): RundownRow[] {
  return items.map((item) => {
    if (item.sort_order < targetSortOrder) {
      return item; // Tidak ada perubahan untuk jadwal sebelum target
    }

    const startMinutes = timeToMinutes(item.time_start) + shiftMinutes;
    const endMinutes = timeToMinutes(item.time_end) + shiftMinutes;

    return {
      ...item,
      time_start: minutesToTime(startMinutes),
      time_end: minutesToTime(endMinutes),
    };
  });
}

function timeToMinutes(timeStr: string): number {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

function minutesToTime(totalMinutes: number): string {
  const normalized = (totalMinutes % (24 * 60) + (24 * 60)) % (24 * 60);
  const hh = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mm = (normalized % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}
3.2 Dynamic Due-Date Badge Evaluation AlgorithmInput Parameters: payment_status, due_date, alert_days_before.State Machine Evaluation:TypeScriptexport type DueDateStatus = 'PAID' | 'OVERDUE' | 'UPCOMING' | 'NEUTRAL';

export interface DueDateEvaluationResult {
  status: DueDateStatus;
  daysDifference: number;
  label: string;
  variant: 'success' | 'destructive' | 'warning' | 'secondary';
}

export function evaluatePaymentDueDate(
  paymentStatus: 'unpaid' | 'paid',
  dueDateString?: string | null,
  alertDaysBefore: number = 7
): DueDateEvaluationResult {
  if (paymentStatus === 'paid') {
    return { status: 'PAID', daysDifference: 0, label: 'Lunas', variant: 'success' };
  }

  if (!dueDateString) {
    return { status: 'NEUTRAL', daysDifference: 0, label: 'Belum Lunas', variant: 'secondary' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'OVERDUE',
      daysDifference: Math.abs(diffDays),
      label: `Terlewat ${Math.abs(diffDays)} Hari`,
      variant: 'destructive',
    };
  }

  if (diffDays <= alertDaysBefore) {
    return {
      status: 'UPCOMING',
      daysDifference: diffDays,
      label: diffDays === 0 ? 'Jatuh Tempo Hari Ini' : `H-${diffDays} Jatuh Tempo`,
      variant: 'warning',
    };
  }

  return {
    status: 'NEUTRAL',
    daysDifference: diffDays,
    label: `H-${diffDays}`,
    variant: 'secondary',
  };
}
4. Offline Synchronization Architecture (Dexie.js / IndexedDB)TypeScript// src/lib/db/dexie-offline.ts
import Dexie, { Table } from 'dexie';

export interface LocalRundownItem {
  id: string;
  event_id: string;
  sort_order: number;
  time_start: string;
  time_end: string;
  activity_title: string;
  pic_name: string;
  is_completed: boolean;
  contingency_plan?: string;
  updated_at: string;
}

export interface LocalCheckinItem {
  id: string;
  event_id: string;
  guest_id: string;
  guest_name: string;
  table_number_or_name?: string;
  actual_pax: number;
  attendance_status: 'pending' | 'attending' | 'declined' | 'checked_in';
  souvenir_received: boolean;
  updated_at: string;
}

export interface OfflineMutationQueue {
  id?: number;
  table_name: 'rundowns' | 'event_guest_assignments';
  record_id: string;
  action_type: 'UPDATE' | 'INSERT';
  payload: Record<string, unknown>;
  created_at_timestamp: number;
}

export class WeddingOfflineStore extends Dexie {
  rundowns!: Table<LocalRundownItem, string>;
  checkins!: Table<LocalCheckinItem, string>;
  mutationQueue!: Table<OfflineMutationQueue, number>;

  constructor() {
    super('WeddingOfflineStore');
    this.version(1).stores({
      rundowns: 'id, event_id, sort_order, updated_at',
      checkins: 'id, event_id, guest_id, attendance_status, souvenir_received, updated_at',
      mutationQueue: '++id, table_name, record_id, created_at_timestamp',
    });
  }
}

export const offlineStore = new WeddingOfflineStore();
4.1 Mutation Flush Algorithm (Last-Write-Wins Strategy)Event listener window.addEventListener('online', flushOfflineQueue) dipicu saat koneksi internet tersambung kembali.Membaca seluruh baris pada mutationQueue yang diurutkan secara ascending berdasarkan created_at_timestamp.Mengirimkan batch request ke Server Action terkait.Menghapus record mutasi dari IndexedDB setelah konfirmasi keberhasilan dari server (HTTP 200 OK).5. Token Protection & Anti Brute-Force Rate LimiterTypeScript// src/lib/utils/rate-limiter.ts
interface FailedAttemptTracker {
  count: number;
  lockedUntil: number;
}

const rateLimitMemoryMap = new Map<string, FailedAttemptTracker>();

const MAX_PIN_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes

export function checkPinRateLimit(clientIp: string): { isAllowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMemoryMap.get(clientIp);

  if (entry && entry.lockedUntil > now) {
    const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { isAllowed: false, retryAfterSeconds: remainingSeconds };
  }

  return { isAllowed: true };
}

export function registerFailedPinAttempt(clientIp: string): { remainingAttempts: number; isLocked: boolean } {
  const now = Date.now();
  const entry = rateLimitMemoryMap.get(clientIp) || { count: 0, lockedUntil: 0 };
  entry.count += 1;

  if (entry.count >= MAX_PIN_FAILURES) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    entry.count = 0;
    rateLimitMemoryMap.set(clientIp, entry);
    return { remainingAttempts: 0, isLocked: true };
  }

  rateLimitMemoryMap.set(clientIp, entry);
  return { remainingAttempts: MAX_PIN_FAILURES - entry.count, isLocked: false };
}

export function clearPinRateLimit(clientIp: string): void {
  rateLimitMemoryMap.delete(clientIp);
}
6. Audit Trail Logging PatternSetiap Server Action wajib membungkus operasi mutasi dengan fungsi log audit standar:TypeScript// src/lib/audit/logger.ts
import { createServerActionClient } from '@/lib/supabase/server';

export interface AuditLogPayload {
  weddingId: string;
  userId?: string | null;
  userDisplayName: string;
  moduleName: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SHIFT_TIMELINE';
  changeDiff?: Record<string, unknown> | null;
}

export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  const supabase = createServerActionClient();
  await supabase.from('audit_logs').insert({
    wedding_id: payload.weddingId,
    user_id: payload.userId || null,
    user_display_name: payload.userDisplayName,
    module_name: payload.moduleName,
    action_type: payload.actionType,
    change_diff: payload.changeDiff || null,
  });
}
