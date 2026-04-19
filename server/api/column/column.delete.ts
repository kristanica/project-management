import { safeParse } from "valibot";
import { number, object } from "valibot";
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  const validated = safeParse(object({ id: number() }), body);

  try {
    if (!validated.success) {
      return {
        title: "Failed to delete column",
        statusCode: 400,
        data: validated.issues,
      };
    }

    const column = await prisma.$transaction(async (tx) => {
      const deltmp = await tx.columns.delete({
        where: {
          id: validated.output.id,
        },
      });

      return deltmp;
    });

    return {
      title: "Column deleted",
      statusCode: 200,
      data: column,
    };
  } catch (e) {
    return e;
  }
});
