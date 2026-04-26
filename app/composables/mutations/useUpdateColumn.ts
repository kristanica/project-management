import { useMutation, useQueryClient } from "@tanstack/vue-query";

type useUpdateColumn = {
  column_id: number;
  title: string;
  color: string;
};

export const useUpdateColumn = ({
  projectId,
  toggleAddColumnModal,
}: AddColumnToBoard & {
  toggleAddColumnModal: Ref<boolean>;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["update-column"],
    mutationFn: async ({ column_id, title, color }: useUpdateColumn) => {
      await $fetch("/api/column/column", {
        method: "put",
        body: {
          column_id,
          title,
          color,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project" + projectId] });
      toggleAddColumnModal.value = false;
    },
  });
};
