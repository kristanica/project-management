import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useDeleteColumn = ({
  projectId,
  toggleDeleteModal,
}: {
  projectId: number;
  toggleDeleteModal: Ref<boolean>;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["delete-column"],
    mutationFn: async (id: number) => {
      try {
        const res = await $fetch("/api/column/column", {
          method: "delete",

          body: {
            id,
          },
        });

        console.log(res);
      } catch (e) {
        throw e;
      }
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project" + projectId] });

      toggleDeleteModal.value = false;
    },
    onError: (e) => {
      console.log(String(e));
    },
  });
};

export default useDeleteColumn;
