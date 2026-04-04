import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useAddColumnToBoard = ({
  title,
  boardId,
  projectId,
  toggleAddColumnModal,
}: AddColumnToBoard & {
  toggleAddColumnModal: Ref<boolean>;
}) => {
  const qc = useQueryClient();
  const { manualError, manualSucceed } = useOnError();
  return useMutation({
    mutationFn: async (title: string): Promise<Columns> => {
      console.log(projectId);
      const res = await $fetch<ServerResponseSucceed<Columns>>(
        "/api/column/column",
        {
          method: "post",
          body: {
            board_id: boardId,
            title: title,
          },
        },
      );

      if (res.statusCode !== 200) {
        throw new Error(String(res.data));
      }

      return {
        id: res.data.id,
        title: res.data.title,
      };
    },
    mutationKey: ["create column"],
    onError: (e) => {
      manualError(e.message);
    },
    onSuccess: () => {
      manualSucceed("Column added");
      qc.invalidateQueries({ queryKey: ["project" + projectId] });
      toggleAddColumnModal.value = false;
    },
  });
};
