import { safeParse } from "valibot";
import { TaskSchemaBackend } from "~/../schema/task.schema";

export default defineEventHandler(
  async (event): Promise<ServerResponseSucceed<Task> | ServerResponseFail> => {
    const body = await readBody(event);
    const validated = safeParse(TaskSchemaBackend, body);

    try {
      if (!validated.success) {
        return {
          title: "Failed to validate insert to task",
          statusCode: 400,
          data: validated.issues.join(","),
        };
      }

      const task = await prisma.tasks.create({
        data: {
          title: validated.output.title,
          description: validated.output.description,
          priority: validated.output.priority,
          column_id: validated.output.columnId,
          project_id: validated.output.projectId,
          board_id: validated.output.boardId,
          status: validated.output.status,
          order: validated.output.order,
        },
      });

      return {
        title: "Tasks inserted",
        data: task,
        statusCode: 200,
      };
    } catch (e) {
      return {
        title: `Failed to Create task `,
        statusCode: 500,
        data: String(e),
      };
    }
  },
);
