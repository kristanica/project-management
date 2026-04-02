import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

import { ProjectSchema } from "~/../schema/project.schema";
import type { Database } from "~/../database.types";
import { safeParse } from "valibot";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const client = serverSupabaseServiceRole<Database>(event);

  const content = await readBody(event);

  const result = safeParse(ProjectSchema, content);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Failed",
      data: result.issues,
    });
  }

  const { data, error } = await client
    .from("projects")
    .insert({
      title: result.output.title,
      description: result.output.description,
      user_id: user.sub,
    })
    .select()
    .single();
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: String(error.message),
    });
  }

  return { data, statusCode: 200, statusMessage: "Project Created" };
});
