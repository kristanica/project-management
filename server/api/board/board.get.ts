export default defineEventHandler(
  async (event): Promise<ServerResponseSucceed<Board> | ServerResponseFail> => {
    const query = getQuery(event);
    const projectId = query.project_id as any | 0;

    try {
      const data = await prisma.boards.findFirst({
        where: {
          project_id: Number(projectId),
        },

        select: {
          id: true,
          title: true,
          created_at: true,
          project_id: true,
          columns: {
            select: {
              id: true,
              title: true,
              order: true,
              task: {
                select: {
                  id: true,
                  column_id: true,
                  title: true,
                  description: true,
                  priority: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      const safeData = toSafeData(data);

      return {
        title: "Data retrieved",
        data: safeData,
        statusCode: 200,
      };
    } catch (e) {
      return {
        title: "Data retrieved",
        data: String(e),
        statusCode: 200,
      };
    }
  },
);
