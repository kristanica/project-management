import { safeParse } from "valibot";
import { prisma } from "~/../server/utils/prisma";
import { reOrderSchema } from "~/../schema/reorder.schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validated = safeParse(reOrderSchema, body);

  if (!validated.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid reorder payload",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.columns.update({
      where: { id: validated.output.newCol.id },
      data: {
        order: validated.output.newCol.order,
      },
    });
    await tx.columns.update({
      where: { id: validated.output.oldCol.id },
      data: {
        order: validated.output.oldCol.order,
      },
    });
  });

  return {
    status: 200,
  };
});
