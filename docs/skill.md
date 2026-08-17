# Engineering Skills, Coding Conventions & Standards Document

## Project: Wedding & Event Companion SaaS
**Version:** 2.1.0 (Dynamic Config & Multi-Tier RBAC Architecture)  
**Core Framework:** Next.js 14+ (App Router, Server Actions, Route Handlers)  
**Language:** TypeScript 5+ (Strict Mode, No Implicit `any`)  
**Validation:** Zod 3+ for Strict Schema Invariants

---

## 1. Production Tech Stack & Verified Dependencies

### 1.1 Core Runtime & Framework
* **Runtime:** Node.js v20+ LTS
* **Web Framework:** Next.js 14.2+ (App Router with React Server Components)
* **Language:** TypeScript 5.4+ (Strict Null Checks, Exact Optional Property Types)

### 1.2 Frontend & UI Libraries
* **Styling Engine:** Tailwind CSS 3.4+
* **Component Primitives:** `shadcn/ui` (Radix UI Primitives)
* **Icons:** `lucide-react`
* **Data Table Engine:** `@tanstack/react-table` v8+
* **Form State Management:** `react-hook-form` + `@hookform/resolvers` + `zod`
* **Client PDF Generation:** `@react-pdf/renderer` v3+
* **Image Compression (Browser):** `browser-image-compression`

### 1.3 Backend, Database & Storage
* **BaaS Engine:** `@supabase/supabase-js` v2+ & `@supabase/ssr`
* **Realtime Protocol:** Supabase WebSocket CDC (Change Data Capture)
* **Object Storage SDK:** `@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner` (v3)
* **Local Offline Engine:** `dexie` v4+ (IndexedDB wrapper)
* **Archive & ZIP Stream:** `archiver` + `csv-stringify`
* **Security & Hashing:** `bcryptjs` (Public PIN Hashing)

---

## 2. Strict Coding Standards & Conventions

### 2.1 File & Directory Naming Rules
* **Components:** Kebab-case (`universal-data-table.tsx`, `event-switcher.tsx`).
* **Server Actions:** Kebab-case with suffix `-actions.ts` (`budget-actions.ts`, `rundown-actions.ts`).
* **Custom Hooks:** Kebab-case with prefix `use-` (`use-realtime-rundown.ts`, `use-offline-sync.ts`).
* **TypeScript Types & Interfaces:** PascalCase (`WeddingEvent`, `PaymentMilestone`, `R2Config`).

### 2.2 Server Components vs. Client Components Boundaries
1. **Server First:** Semua halaman di `src/app/` dan *layout* adalah Server Components (RSC) secara default untuk memaksimalkan performa *initial load* (LCP < 1.2 detik).
2. **Client Leaf Boundary (`'use client'`):** Hanya gunakan `'use client'` pada komponen daun (*leaf components*) yang berinteraksi dengan:
   * State lokal React (`useState`, `useReducer`, `useEffect`).
   * Browser DOM events (`onClick`, `onChange`, `onSubmit`).
   * Browser-only APIs (IndexedDB `Dexie.js`, `window.navigator.onLine`).
   * WebSocket realtime subscriptions (`supabase.channel`).
3. **Environment Security:** Variabel sensitif (`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `CRON_SECRET`) HANYA boleh dipanggil di Server Actions atau Route Handlers.

---

## 3. Standard TypeScript Interfaces & Zod Validation Schemas

### 3.1 Dynamic Budget Item & Multiple Milestones Schema
```typescript
import { z } from 'zod';

export const PaymentMilestoneInputSchema = z.object({
  milestone_name: z.string().min(2, 'Nama termin minimal 2 karakter (misal: DP 1, Pelunasan)'),
  amount: z.number().positive('Nominal pembayaran harus lebih besar dari 0'),
  due_date: z.string().optional().nullable(),
  alert_days_before: z.number().int().min(1).default(7),
  paid_by: z.enum(['groom', 'bride', 'joint']).default('joint'),
});

export const BudgetItemInputSchema = z.object({
  wedding_id: z.string().uuid(),
  event_id: z.string().uuid(),
  category_id: z.string().uuid().optional().nullable(),
  vendor_id: z.string().uuid().optional().nullable(),
  item_name: z.string().min(3, 'Nama pos pengeluaran minimal 3 karakter'),
  estimated_cost: z.number().nonnegative('Estimasi biaya tidak boleh negatif'),
  target_payer: z.enum(['groom', 'bride', 'joint']).default('joint'),
  notes: z.string().optional().nullable(),
  milestones: z.array(PaymentMilestoneInputSchema).min(1, 'Minimal harus menyertakan 1 termin pembayaran'),
});

export type BudgetItemInput = z.infer<typeof BudgetItemInputSchema>;
export type PaymentMilestoneInput = z.infer<typeof PaymentMilestoneInputSchema>;
3.2 Dynamic Storage & R2 Superadmin Configuration Schema
TypeScript
import { z } from 'zod';

export const R2CredentialsSchema = z.object({
  accountId: z.string().min(10, 'Account ID Cloudflare tidak valid'),
  accessKeyId: z.string().min(10, 'Access Key ID tidak valid'),
  secretAccessKey: z.string().min(20, 'Secret Access Key tidak valid'),
  bucketName: z.string().min(3, 'Nama bucket minimal 3 karakter'),
  publicCdnDomain: z.string().url('Public CDN Domain harus berupa URL valid'),
});

export const StorageRulesSchema = z.object({
  maxImageSizeMb: z.number().int().min(1).max(25).default(5),
  maxPdfSizeMb: z.number().int().min(1).max(50).default(15),
  targetImageFormat: z.enum(['webp', 'jpeg']).default('webp'),
  imageQualityRatio: z.number().min(0.1).max(1.0).default(0.8),
  allowedMimeTypes: z.array(z.string()).min(1),
});

export type R2CredentialsInput = z.infer<typeof R2CredentialsSchema>;
export type StorageRulesInput = z.infer<typeof StorageRulesSchema>;
4. Production Server Action Implementation Pattern
Pola baku penulisan Server Actions yang mencakup autentikasi, validasi Zod, eksekusi PostgreSQL, mutasi child table, pencatatan audit log, dan revalidasi cache Next.js:

TypeScript
// src/actions/budget-actions.ts
'use server';

import { createServerActionClient } from '@/lib/supabase/server';
import { recordAuditLog } from '@/lib/audit/logger';
import { BudgetItemInputSchema, BudgetItemInput } from '@/types/budget.types';
import { revalidatePath } from 'next/cache';

export async function createBudgetItemWithMilestonesAction(input: BudgetItemInput) {
  // 1. Zod Validation
  const validated = BudgetItemInputSchema.parse(input);
  const supabase = createServerActionClient();

  // 2. Auth Session Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Akses ditolak: Sesi pengguna tidak terautentikasi.');
  }

  // 3. Insert Parent Budget Item
  const { data: item, error: itemError } = await supabase
    .from('budget_items')
    .insert({
      event_id: validated.event_id,
      category_id: validated.category_id || null,
      vendor_id: validated.vendor_id || null,
      item_name: validated.item_name,
      estimated_cost: validated.estimated_cost,
      target_payer: validated.target_payer,
      notes: validated.notes || null,
    })
    .select()
    .single();

  if (itemError || !item) {
    throw new Error(`Gagal menyimpan pos bujet: ${itemError?.message}`);
  }

  // 4. Insert Child Milestones
  const milestonesPayload = validated.milestones.map((m) => ({
    budget_item_id: item.id,
    milestone_name: m.milestone_name,
    amount: m.amount,
    due_date: m.due_date || null,
    alert_days_before: m.alert_days_before,
    payment_status: 'unpaid' as const,
    paid_by: m.paid_by,
  }));

  const { error: milestoneError } = await supabase
    .from('payment_milestones')
    .insert(milestonesPayload);

  if (milestoneError) {
    throw new Error(`Gagal menyimpan termin pembayaran: ${milestoneError.message}`);
  }

  // 5. Record Centralized Audit Trail
  await recordAuditLog({
    weddingId: validated.wedding_id,
    userId: user.id,
    userDisplayName: user.user_metadata?.full_name || user.email || 'Pengguna',
    moduleName: 'Budget',
    actionType: 'CREATE',
    changeDiff: {
      item_name: item.item_name,
      estimated_cost: item.estimated_cost,
      milestones_count: milestonesPayload.length,
    },
  });

  // 6. Next.js On-Demand Cache Revalidation
  revalidatePath(`/dashboard/${validated.wedding_id}/budget`, 'page');

  return { success: true, data: item };
}