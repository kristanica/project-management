import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

import { ProjectSchema } from "~/../schema/project.schema";
import { safeParse } from "valibot";
import { Database } from "~/../database.types";
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

  // create is from supabase function
  const { data, error } = await client.rpc("create_project_with_board", {
    b_title: result.output.title,
    p_description: result.output.description,
    p_title: result.output.title,
    p_user_id: user.sub,
  });

  if (error)
    throw createError({ statusCode: 400, statusMessage: error.message });

  return { data, statusCode: 200, statusMessage: "Project Created" };
});
