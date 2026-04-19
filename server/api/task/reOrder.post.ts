import { number, object, safeParse } from "valibot";
import { tryCatch } from "~~/shared/tryCatch";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validated = safeParse(
    object({
      from: object({
        task_id: number(),
        order: number(),

        column_id: number(),
      }),
      to: object({
        order: number(),
        task_id: number(),
        column_id: number(),
      }),
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

  const { from, to } = validated.output;

  const [data, error] = await tryCatch(
    prisma.$transaction(async (tx) => {
      if (from.column_id === to.column_id) {
        if (from.order > to.order) {
          //   move up
          await tx.tasks.updateMany({
            where: {
              column_id: from.column_id,
              order: {
                gte: to.order,
                lt: from.order,
              },
              id: { not: to.task_id },
            },
            data: {
              order: { increment: 1 },
            },
          });
        } else if (from.order < to.order) {
          await tx.tasks.updateMany({
            // move down
            where: {
              column_id: from.column_id,
              order: {
                gt: from.order,
                lte: to.order,
              },
              id: { not: to.task_id },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        }
      } else if (from.column_id !== to.column_id) {
        // udpate order from the prev column by decrementing it
        await tx.tasks.updateMany({
          where: {
            column_id: from.column_id,
            order: { gt: from.order },
          },
          data: {
            order: { decrement: 1 },
          },
        });

        // Makes space on the new column
        await tx.tasks.updateMany({
          where: {
            column_id: to.column_id,
            order: { gte: to.order },
          },
          data: {
            order: { increment: 1 },
          },
        });
      }

      await tx.tasks.update({
        where: {
          id: to.task_id,
        },
        data: {
          order: to.order,
          column_id: to.column_id,
        },
      });
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
    title: "Task reordered",
    statusCode: 200,
    data,
  };
});
