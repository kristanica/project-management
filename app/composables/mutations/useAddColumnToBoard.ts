import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useAddColumnToBoard = ({
  projectId,
  toggleAddColumnModal,
}: AddColumnToBoard & {
  toggleAddColumnModal: Ref<boolean>;
}) => {
  const qc = useQueryClient();
  const { manualSucceed } = useOnError();
  return useMutation({
    mutationFn: async ({
      title,
      board_id,
      order,
      color,
    }: {
      title: string;
      board_id: number;
      order: number;
      color: string;
    }) => {
      console.log(title, board_id, order);
      const res = await $fetch<ServerResponseSucceed<Columns>>(
        "/api/column/column",
        {
          method: "post",
          body: {
            board_id: board_id,
            title: title,
            order: order,
            color: color,
          },
        },
      );

      if (res.statusCode !== 201) {
        console.log(color);
        console.log(res);
        throw new Error(String(res.data));
      }

      return {
        id: res.data.id,
        title: res.data.title,
        order: res.data.order,
      };
    },
    mutationKey: ["create column"],
    onError: (e) => {
      console.log(String(e.message));
    },
    onSuccess: () => {
      manualSucceed("Column added");
      qc.invalidateQueries({ queryKey: ["project" + projectId] });
      toggleAddColumnModal.value = false;
    },
  });
};
