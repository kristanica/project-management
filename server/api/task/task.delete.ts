import { object, safeParse, number } from "valibot";
import { tryCatch } from "~~/shared/tryCatch";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validated = safeParse(
    object({
      id: number(),
    }),
    body,
  );
  if (!validated.success) {
    return {
      title: "Failed to delete column",
      statusCode: 400,
      data: validated.issues,
    };
  }
  const [task, error] = await tryCatch(
    prisma.tasks.delete({
      where: {
        id: validated.output.id,
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
    title: "Column deleted",
    statusCode: 200,
    data: task,
  };
});
