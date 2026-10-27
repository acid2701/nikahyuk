class BrowserQueryBuilder {
  private tableName: string;
  private selectCols: string = "*";
  private filters: Array<{ col: string; op: string; val: any }> = [];
  private orderConfig: { col: string; asc: boolean } | null = null;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private countMode: "exact" | null = null;
  private mutationType: "insert" | "update" | null = null;
  private mutationValues: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(cols: string = "*", options?: { count?: "exact" }) {
    this.selectCols = cols;
    if (options?.count) this.countMode = options.count;
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

  eq(col: string, val: any) {
    this.filters.push({ col, op: "eq", val });
    return this;
  }

  neq(col: string, val: any) {
    this.filters.push({ col, op: "neq", val });
    return this;
  }

  in(col: string, val: any[]) {
    this.filters.push({ col, op: "in", val });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderConfig = { col, asc: options?.ascending ?? true };
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

  async then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    try {
      const res = await fetch("/api/rpc/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: this.tableName,
          mutationType: this.mutationType,
          mutationValues: this.mutationValues,
          select: this.selectCols,
          filters: this.filters,
          order: this.orderConfig,
          limit: this.limitCount,
          single: this.isSingle,
          maybeSingle: this.isMaybeSingle,
          count: this.countMode,
        }),
      });
      const data = await res.json();
      resolve(data);
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err, count: 0 });
    }
  }
}

class BrowserRealtimeChannel {
  private channelName: string;

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on(_event: string, _filter: any, _callback: (payload: any) => void) {
    return this;
  }

  subscribe() {
    return this;
  }

  unsubscribe() {
    return Promise.resolve();
  }
}

export function createClient() {
  return {
    from: (tableName: string) => new BrowserQueryBuilder(tableName),
    channel: (channelName: string) => new BrowserRealtimeChannel(channelName),
    removeChannel: (_channel: any) => Promise.resolve(),
    auth: {
      getUser: async () => {
        try {
          const res = await fetch("/api/auth/me");
          if (!res.ok) return { data: { user: null }, error: null };
          const json = await res.json();
          return { data: { user: json.user }, error: null };
        } catch {
          return { data: { user: null }, error: null };
        }
      },
      signOut: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        return { error: null };
      },
    },
  };
}
