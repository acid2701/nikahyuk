import { pool } from "@/lib/pg-pool";
import { getCurrentUser, formatSupabaseUser } from "@/lib/auth/session";

type QueryFilter = {
  column: string;
  op: "eq" | "neq" | "in" | "or" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike";
  value: any;
};

class PostgresQueryBuilder {
  private tableName: string;
  private selectCols: string = "*";
  private filters: QueryFilter[] = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private isHeadOnly: boolean = false;
  private countMode: "exact" | null = null;

  // Mutation properties
  private mutationType: "insert" | "update" | "delete" | "upsert" | null = null;
  private mutationValues: any = null;
  private upsertOptions: { onConflict?: string } | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*", options?: { count?: "exact"; head?: boolean }) {
    this.selectCols = columns;
    if (options?.count) this.countMode = options.count;
    if (options?.head) this.isHeadOnly = options.head;
    return this;
  }

  insert(values: any) {
    this.mutationType = "insert";
    this.mutationValues = values;
    return this;
  }

  update(values: any) {
    this.mutationType = "update";
    this.mutationValues = values;
    return this;
  }

  upsert(values: any, options?: { onConflict?: string }) {
    this.mutationType = "upsert";
    this.mutationValues = values;
    this.upsertOptions = options || null;
    return this;
  }

  delete() {
    this.mutationType = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, op: "neq", value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ column, op: "in", value: values });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ column, op: "gt", value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ column, op: "gte", value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ column, op: "lt", value });
    return this;
  }

  ilike(column: string, value: string) {
    this.filters.push({ column, op: "ilike", value });
    return this;
  }

  is(column: string, value: any) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  or(filterString: string) {
    this.filters.push({ column: "", op: "or", value: filterString });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    this.limitCount = 1;
    return this;
  }

  /**
   * Execute Query asynchronously (Promise-like)
   */
  async then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    try {
      const res = await this.execute();
      resolve(res);
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err, count: 0 });
    }
  }

  private async execute(): Promise<{ data: any; error: any; count: number | null }> {
    try {
      if (this.mutationType === "insert") {
        return await this.executeInsert();
      } else if (this.mutationType === "update") {
        return await this.executeUpdate();
      } else if (this.mutationType === "delete") {
        return await this.executeDelete();
      } else if (this.mutationType === "upsert") {
        return await this.executeUpsert();
      } else {
        return await this.executeSelect();
      }
    } catch (err: any) {
      return {
        data: null,
        error: { message: err?.message || String(err), code: err?.code },
        count: null,
      };
    }
  }

  private async executeInsert() {
    const rawItems = Array.isArray(this.mutationValues)
      ? this.mutationValues
      : [this.mutationValues];

    if (rawItems.length === 0) {
      return { data: [], error: null, count: 0 };
    }

    const firstItem = rawItems[0];
    const columns = Object.keys(firstItem);
    const colList = columns.map((c) => `"${c}"`).join(", ");

    const valueRows: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    for (const item of rawItems) {
      const rowPlaceholders: string[] = [];
      for (const col of columns) {
        let val = item[col];
        if (typeof val === "object" && val !== null && !(val instanceof Date)) {
          val = JSON.stringify(val);
        }
        params.push(val);
        rowPlaceholders.push(`$${paramIdx++}`);
      }
      valueRows.push(`(${rowPlaceholders.join(", ")})`);
    }

    const query = `
      INSERT INTO "${this.tableName}" (${colList})
      VALUES ${valueRows.join(", ")}
      RETURNING *;
    `;

    const result = await pool.query(query, params);
    const data = Array.isArray(this.mutationValues)
      ? result.rows
      : this.isSingle || this.isMaybeSingle
      ? result.rows[0] || null
      : result.rows;

    return { data, error: null, count: result.rowCount };
  }

  private async executeUpdate() {
    const keys = Object.keys(this.mutationValues);
    if (keys.length === 0) {
      return { data: [], error: null, count: 0 };
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    for (const k of keys) {
      let val = this.mutationValues[k];
      if (typeof val === "object" && val !== null && !(val instanceof Date)) {
        val = JSON.stringify(val);
      }
      setClauses.push(`"${k}" = $${paramIdx++}`);
      params.push(val);
    }

    const whereClauses: string[] = [];
    this.buildWhereClauses(whereClauses, params, () => paramIdx++);

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const query = `
      UPDATE "${this.tableName}"
      SET ${setClauses.join(", ")}
      ${whereSql}
      RETURNING *;
    `;

    const result = await pool.query(query, params);
    const data = this.isSingle || this.isMaybeSingle ? result.rows[0] || null : result.rows;
    return { data, error: null, count: result.rowCount };
  }

  private async executeDelete() {
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    this.buildWhereClauses(whereClauses, params, () => paramIdx++);

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const query = `
      DELETE FROM "${this.tableName}"
      ${whereSql}
      RETURNING *;
    `;

    const result = await pool.query(query, params);
    return { data: result.rows, error: null, count: result.rowCount };
  }

  private async executeUpsert() {
    const item = this.mutationValues;
    const columns = Object.keys(item);
    const colList = columns.map((c) => `"${c}"`).join(", ");

    const params: any[] = [];
    let paramIdx = 1;
    const placeholders: string[] = [];

    for (const col of columns) {
      let val = item[col];
      if (typeof val === "object" && val !== null && !(val instanceof Date)) {
        val = JSON.stringify(val);
      }
      params.push(val);
      placeholders.push(`$${paramIdx++}`);
    }

    const conflictCol = this.upsertOptions?.onConflict || "id";
    const updateClauses = columns
      .filter((c) => c !== conflictCol)
      .map((c) => `"${c}" = EXCLUDED."${c}"`)
      .join(", ");

    const query = `
      INSERT INTO "${this.tableName}" (${colList})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT ("${conflictCol}")
      DO UPDATE SET ${updateClauses}
      RETURNING *;
    `;

    const result = await pool.query(query, params);
    const data = this.isSingle || this.isMaybeSingle ? result.rows[0] || null : result.rows;
    return { data, error: null, count: result.rowCount };
  }

  private async executeSelect() {
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    this.buildWhereClauses(whereClauses, params, () => paramIdx++);

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count query
    let totalCount: number | null = null;
    if (this.countMode === "exact") {
      const countRes = await pool.query(
        `SELECT COUNT(*) as total FROM "${this.tableName}" ${whereSql};`,
        params
      );
      totalCount = parseInt(countRes.rows[0]?.total || "0", 10);
      if (this.isHeadOnly) {
        return { data: null, error: null, count: totalCount };
      }
    }

    // Normal select query
    let query = `SELECT ${this.sanitizeSelectCols(this.selectCols)} FROM "${this.tableName}" ${whereSql}`;

    if (this.orderCol) {
      query += ` ORDER BY "${this.orderCol}" ${this.orderAsc ? "ASC" : "DESC"}`;
    }

    if (this.limitCount !== null) {
      query += ` LIMIT ${this.limitCount}`;
    }

    const result = await pool.query(query, params);
    let data: any = result.rows;

    if (this.isSingle) {
      data = result.rows[0] || null;
      if (!data) {
        return {
          data: null,
          error: { message: "No rows found in .single() query", code: "PGRST116" },
          count: totalCount,
        };
      }
    } else if (this.isMaybeSingle) {
      data = result.rows[0] || null;
    }

    return { data, error: null, count: totalCount ?? result.rowCount };
  }

  private sanitizeSelectCols(cols: string): string {
    if (!cols || cols.trim() === "*") return "*";
    // Jika ada embedded relation seperti '*, weddings(*)', ambil '*' tabel utama
    if (cols.includes("(")) {
      return "*";
    }
    return cols
      .split(",")
      .map((c) => c.trim())
      .map((c) => (c === "*" ? "*" : `"${c.replace(/"/g, "")}"`))
      .join(", ");
  }

  private buildWhereClauses(
    clauses: string[],
    params: any[],
    getNextParamIdx: () => number
  ) {
    for (const f of this.filters) {
      if (f.op === "eq") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" = $${idx}`);
        params.push(f.value);
      } else if (f.op === "neq") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" != $${idx}`);
        params.push(f.value);
      } else if (f.op === "in") {
        if (!Array.isArray(f.value) || f.value.length === 0) {
          clauses.push("1=0");
        } else {
          const inPlaceholders = f.value.map(() => `$${getNextParamIdx()}`);
          clauses.push(`"${f.column}" IN (${inPlaceholders.join(", ")})`);
          params.push(...f.value);
        }
      } else if (f.op === "gt") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" > $${idx}`);
        params.push(f.value);
      } else if (f.op === "gte") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" >= $${idx}`);
        params.push(f.value);
      } else if (f.op === "lt") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" < $${idx}`);
        params.push(f.value);
      } else if (f.op === "lte") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" <= $${idx}`);
        params.push(f.value);
      } else if (f.op === "ilike") {
        const idx = getNextParamIdx();
        clauses.push(`"${f.column}" ILIKE $${idx}`);
        params.push(f.value);
      } else if (f.op === "or") {
        // e.g. "user_id.eq.xxx,email.eq.yyy"
        const parts = String(f.value).split(",");
        const orClauses: string[] = [];
        for (const p of parts) {
          const [col, op, val] = p.split(".");
          if (col && op === "eq") {
            const idx = getNextParamIdx();
            orClauses.push(`"${col}" = $${idx}`);
            params.push(val);
          }
        }
        if (orClauses.length > 0) {
          clauses.push(`(${orClauses.join(" OR ")})`);
        }
      }
    }
  }
}

/**
 * Server-side native PostgreSQL client mimicking Supabase interface
 */
export async function createClient() {
  const session = await getCurrentUser();

  return {
    from: (tableName: string) => new PostgresQueryBuilder(tableName),
    auth: {
      getUser: async () => {
        if (!session) {
          return { data: { user: null }, error: null };
        }
        return { data: { user: formatSupabaseUser(session) }, error: null };
      },
      updateUser: async (_attributes: any) => {
        return { data: { user: session ? formatSupabaseUser(session) : null }, error: null };
      },
      signOut: async () => {
        return { error: null };
      },
      signInWithPassword: async () => {
        return { data: { user: null }, error: { message: "Gunakan API /api/auth/login" } };
      },
    },
  };
}

export function createAdminClient() {
  return {
    from: (tableName: string) => new PostgresQueryBuilder(tableName),
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [] as any[] }, error: null }),
        createUser: async (attributes: any) => ({
          data: {
            user: {
              id: `usr_${Date.now()}`,
              email: attributes?.email,
              user_metadata: attributes?.user_metadata || {},
            },
          },
          error: null,
        }),
        updateUserById: async (id: string, attributes: any) => ({
          data: {
            user: {
              id,
              email: attributes?.email,
              user_metadata: attributes?.user_metadata || {},
            },
          },
          error: null,
        }),
        deleteUser: async (_id: string) => ({ data: { user: null }, error: null }),
      },
    },
  };
}
