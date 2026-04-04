import { serverSupabaseServiceRole } from "#supabase/server";
import { safeParse } from "valibot";
import { TaskSchemaBackend } from "~/../schema/task.schema";

import { Database } from "~~/database.types";
export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event);
  const body = await readBody(event);

  const validated = safeParse(TaskSchemaBackend, body);
});
