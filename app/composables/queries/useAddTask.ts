import { useMutation, useQueryClient } from "@tanstack/vue-query";

type UseAddTask = {
  boardId: number;
  columnId: number;
  projectId: number;
};

export const useAddTask = ({ boardId, columnId, projectId }: UseAddTask) => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["addTask" + projectId, columnId, boardId],
    mutationFn: async ({ title, description }: AddTask) => {
      console.log(title, description, projectId, boardId);
    },
    onError: () => {},

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project" + projectId] });
    },
  });
};
