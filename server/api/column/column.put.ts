import { number, object, safeParse, string } from "valibot";
import { ColumnSchema } from "~~/schema/column.schema";
import { tryCatch } from "~~/shared/tryCatch";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  const validated = safeParse(
    object({
      column_id: number(),
      title: string(),
      color: string(),
    }),
    body,
  );

  if (!validated.success) {
    return {
      title: "Failed to reorder task",
      statusCode: 400,
      data: validated.issues,
    };
  }

  const [data, error] = await tryCatch(
    prisma.columns.update({
      where: {
        id: validated.output.column_id,
      },
      data: {
        title: validated.output.title,
        color: validated.output.color,
      },
    }),
  );

  if (error) {
    return {
      title: "Database error",
      statusCode: 500,
      data: error.message,
    };
  }

  return {
    title: "Column Updated",
    statusCode: 200,
    data,
  };
});
