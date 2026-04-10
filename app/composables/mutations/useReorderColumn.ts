import { useMutation } from "@tanstack/vue-query";

export default function useReorderColumn() {
  return useMutation({
    mutationKey: ["reorder column"],
    mutationFn: async ({ oldCol, newCol }: ReOrder) => {
      await $fetch("/api/column/reOrder", {
        method: "POST",
        body: {
          oldCol,
          newCol,
        },
      });
    },
  });
}
