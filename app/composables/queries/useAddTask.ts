import { useMutation, useQueryClient } from "@tanstack/vue-query";

type UseAddTask = {
  boardId: number;
  columnId: number;
  projectId: number;
};

export const useAddTask = (projectId: number) => {
  const qc = useQueryClient();

  const { manualError } = useOnError();
  return useMutation({
    mutationKey: ["addTask"],
    mutationFn: async (task: AddTask & UseAddTask): Promise<Task> => {
      const res = await $fetch<ServerResponseSucceed<Task>>("/api/task/task", {
        method: "POST",
        body: {
          ...task,
        },
      });

      if (res.statusCode !== 200) {
        console.log(res.statusCode);
        throw new Error(String(res.data));
      }
      return {
        id: res.data.id,
        title: res.data.title,
        description: res.data.description,
        priority: res.data.priority,
        status: res.data.status,
      };
    },
    onError: (e) => {
      console.log(String(e));
      manualError(String(e.message));
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project" + projectId] });
    },
  });
};
