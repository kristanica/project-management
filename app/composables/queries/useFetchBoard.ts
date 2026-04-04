import { queryOptions } from "@tanstack/vue-query";
import { safeParse } from "valibot";
import { BoardSchema } from "~/../schema/board.schema";
export const useFetchBoard = (projectId: number) =>
  queryOptions({
    queryKey: ["project" + projectId],
    queryFn: async (): Promise<Board> => {
      const res = await $fetch<ServerResponseSucceed<Board>>(
        `/api/board/board?project_id=${projectId}`,
        {
          method: "GET",
        },
      );

      if (res.statusCode !== 200) {
        return [] as unknown as Board;
      }

      const validated = safeParse(BoardSchema, res.data);
      if (!validated.success) {
        console.error("Validation failed:", validated.issues);
        throw new Error("Invalid API response format");
      }
      return validated.output;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
  });
