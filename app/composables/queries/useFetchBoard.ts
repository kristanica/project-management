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

      console.log(res.data);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
  });
