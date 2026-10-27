import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg-pool";

export async function POST(req: NextRequest) {
  try {
    const {
      table,
      mutationType,
      mutationValues,
      select = "*",
      filters = [],
      order,
      limit,
      single,
      maybeSingle,
      count,
    } = await req.json();

    if (!table) {
      return NextResponse.json({ error: "Parameter 'table' wajib diisi" }, { status: 400 });
    }

    // Whitelist tabel valid
    const allowedTables = [
      "weddings",
      "wedding_collaborators",
      "wedding_events",
      "wedding_checklists",
      "guest_categories",
      "guests",
      "event_tables",
      "event_guest_assignments",
      "vendors",
      "vendor_documents",
      "vendor_partners",
      "budget_categories",
      "budget_items",
      "payment_milestones",
      "payment_attachments",
      "rundowns",
      "rundown_cues",
      "souvenirs",
      "gifts_log",
      "shareable_tokens",
      "audit_logs",
      "system_settings",
      "global_role_templates",
      "system_backups",
      "user_notifications",
    ];

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: `Tabel '${table}' tidak diizinkan` }, { status: 403 });
    }

    if (mutationType === "insert" && mutationValues) {
      const items = Array.isArray(mutationValues) ? mutationValues : [mutationValues];
      if (items.length === 0) return NextResponse.json({ data: [], error: null });
      const cols = Object.keys(items[0]);
      const colNames = cols.map((c) => `"${c}"`).join(", ");
      const params: any[] = [];
      const valClauses: string[] = [];
      let pIdx = 1;
      for (const it of items) {
        const rowP = cols.map((c) => {
          params.push(it[c]);
          return `$${pIdx++}`;
        });
        valClauses.push(`(${rowP.join(", ")})`);
      }
      const insRes = await pool.query(
        `INSERT INTO "${table}" (${colNames}) VALUES ${valClauses.join(", ")} RETURNING *;`,
        params
      );
      return NextResponse.json({
        data: Array.isArray(mutationValues) ? insRes.rows : insRes.rows[0],
        error: null,
      });
    }

    if (mutationType === "update" && mutationValues) {
      const cols = Object.keys(mutationValues);
      const params: any[] = [];
      let pIdx = 1;
      const setClauses = cols.map((c) => {
        params.push(mutationValues[c]);
        return `"${c}" = $${pIdx++}`;
      });

      const whereClauses: string[] = [];
      for (const f of filters) {
        if (f.op === "eq") {
          whereClauses.push(`"${f.col}" = $${pIdx++}`);
          params.push(f.val);
        }
      }
      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const updRes = await pool.query(
        `UPDATE "${table}" SET ${setClauses.join(", ")} ${whereSql} RETURNING *;`,
        params
      );
      return NextResponse.json({ data: updRes.rows, error: null });
    }

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    for (const f of filters) {
      if (f.op === "eq") {
        whereClauses.push(`"${f.col}" = $${paramIdx++}`);
        params.push(f.val);
      } else if (f.op === "neq") {
        whereClauses.push(`"${f.col}" != $${paramIdx++}`);
        params.push(f.val);
      } else if (f.op === "in") {
        if (!Array.isArray(f.val) || f.val.length === 0) {
          whereClauses.push("1=0");
        } else {
          const inPlaceholders = f.val.map(() => `$${paramIdx++}`);
          whereClauses.push(`"${f.col}" IN (${inPlaceholders.join(", ")})`);
          params.push(...f.val);
        }
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    let totalCount: number | null = null;
    if (count === "exact") {
      const countRes = await pool.query(
        `SELECT COUNT(*) as total FROM "${table}" ${whereSql};`,
        params
      );
      totalCount = parseInt(countRes.rows[0]?.total || "0", 10);
    }

    let query = `SELECT ${select.replace(/[^a-zA-Z0-9_*, ]/g, "")} FROM "${table}" ${whereSql}`;

    if (order?.col) {
      query += ` ORDER BY "${order.col}" ${order.asc ? "ASC" : "DESC"}`;
    }

    if (limit) {
      query += ` LIMIT ${Number(limit)}`;
    }

    const result = await pool.query(query, params);
    let data: any = result.rows;

    if (single) {
      data = result.rows[0] || null;
      if (!data) {
        return NextResponse.json(
          { data: null, error: { message: "Row not found", code: "PGRST116" }, count: totalCount },
          { status: 404 }
        );
      }
    } else if (maybeSingle) {
      data = result.rows[0] || null;
    }

    return NextResponse.json({ data, error: null, count: totalCount ?? result.rowCount });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : "Query failed", count: 0 },
      { status: 500 }
    );
  }
}
