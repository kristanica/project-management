import { serverSupabaseServiceRole } from "#supabase/server";
import { safeParse } from "valibot";
import { TaskSchemaBackend } from "~/../schema/task.schema";

import { Database } from "~~/database.types";
export default defineEventHandler(
  async (event): Promise<ServerResponseSucceed<Task> | ServerResponseFail> => {
    const client = serverSupabaseServiceRole<Database>(event);
    const body = await readBody(event);
    const validated = safeParse(TaskSchemaBackend, body);

    if (!validated.success) {
      return {
        title: "Failed to validate insert to task",
        statusCode: 400,
        data: validated.issues.join(","),
      };
    }

    const { data, error } = await client
      .from("tasks")
      .insert({
        title: validated.output.title,
        description: validated.output.description,
        priority: validated.output.priority,
        column_id: validated.output.columnId,
        project_id: validated.output.projectId,
        board_id: validated.output.boardId,
        status: validated.output.status,
        order: 1,
      })
      .select()
      .single()
      .overrideTypes<Task>();

    console.log(validated.output);
    if (error) {
      return {
        title: `Failed to Create task `,
        statusCode: 400,
        data: error.message,
      };
    }

    return {
      title: "Tasks inserted",
      data: data,
      statusCode: 200,
    };
  },
);
