import { createAdminClient as serverAdminClient } from "./server";

export function createAdminClient() {
  return serverAdminClient();
}
