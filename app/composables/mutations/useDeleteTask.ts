import { useMutation, useQueryClient } from "@tanstack/vue-query";

const useDeleteTask = ({
  projectId,
  toggleDeleteModal,
}: {
  projectId: number;
  toggleDeleteModal: Ref<boolean>;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["delete-task"],
    mutationFn: async (id: number) => {
      await $fetch("/api/task/task", {
        method: "delete",
        body: {
          id,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project" + projectId] });
      toggleDeleteModal.value = false;
    },
  });
};

export default useDeleteTask;
