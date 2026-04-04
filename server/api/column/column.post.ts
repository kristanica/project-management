import { serverSupabaseServiceRole } from "#supabase/server";
import { safeParse } from "valibot";
import { ColumnSchema } from "~/../schema/column.schema";
import { Database } from "~~/database.types";

export default defineEventHandler(
  async (
    event,
  ): Promise<ServerResponseSucceed<Columns> | ServerResponseFail> => {
    const body = await readBody(event);
    const client = serverSupabaseServiceRole<Database>(event);
    const validated = safeParse(ColumnSchema, body);

    if (!validated.success) {
      return {
        title: "Failed to validate new column",
        statusCode: 400,
        data: String(validated.issues),
      };
    }
    const { data, error } = await client
      .from("columns")
      .insert({
        title: validated.output.title,
        board_id: validated.output.board_id,
      })
      .select()
      .single()
      .overrideTypes<Columns>();

    if (error) {
      return {
        title: `Failed to Create column for board ${validated.output.title}`,
        statusCode: 400,
        data: error.message,
      };
    }

    return {
      data: data,
      statusCode: 200,
      title: "Column added",
    };
  },
);
