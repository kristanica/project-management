import { useMutation } from "@tanstack/vue-query";
type TaskOrderType = {
  task_id: number;
  order: number;
  column_id: number;
};

type MutationType = {
  from: TaskOrderType;
  to: TaskOrderType;
};

const useOrderTask = () => {
  return useMutation({
    mutationKey: ["order-task"],
    mutationFn: async ({ from, to }: MutationType) => {
      await $fetch("/api/task/reOrder", {
        method: "POST",
        body: {
          from,
          to,
        },
      });
    },
  });
};

export default useOrderTask;
