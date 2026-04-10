import { safeParse } from "valibot";
import { ColumnSchema } from "~/../schema/column.schema";

export default defineEventHandler(
  async (
    event,
  ): Promise<
    | ServerResponseSucceed<{
        created_at: Date;
        id: number;
        title: string;
        board_id: number;
      }>
    | ServerResponseFail
  > => {
    const body = await readBody(event);
    console.log(body);
    const validated = safeParse(ColumnSchema, body);

    try {
      if (!validated.success) {
        return {
          title: "Failed to validate new column",
          statusCode: 400,
          data: validated.issues,
        };
      }

      const column = await prisma.columns.create({
        data: {
          title: validated.output.title,
          board_id: validated.output.board_id,
          order: validated.output.order + 1,
        },
      });

      return {
        title: "Column added",
        statusCode: 201,
        data: column,
      };
    } catch (e) {
      return {
        data: String(e),
        statusCode: 500,
        title: "Failed to create column",
      };
    }
  },
);
