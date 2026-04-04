<template>
  <div>
    <Header v-if="data" :title="data?.title" @open-modal="openModal"></Header>
    <div v-else>Loading...</div>
  </div>

  <div :class="['grid gap-5 mt-5', `grid-cols-${data?.columns?.length || 1}`]">
    <UCard v-for="column in data?.columns">
      <template #header :key="column.id">
        {{ column.title }}
      </template>

      <h1>body!</h1>

      <template #footer>
        <UButton class="w-full flex items-center justify-center"
          >Add a task</UButton
        >
      </template>
    </UCard>
  </div>

  <UModal :dismissible="true" v-model:open="toggleModal">
    <template #header>
      <div class="block">
        <h1 class="text-xl font-bold">Create a new Column</h1>
        <p class="text-sm">
          Create a new Column for the board: <i>{{ data?.title }}</i>
        </p>
      </div>
    </template>
    <template #body>
      <Addcolumnform
        :is-pending="isPending"
        @on-submit="onSubmitColumn"
      ></Addcolumnform>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import Header from "~/components/Board/header.vue";
import * as v from "valibot";
import Addcolumnform from "~/components/Board/addcolumnform.vue";

const route = useRoute();
const toggleModal = ref<boolean>(false);
const openModal = () => {
  toggleModal.value = true;
};

useHead(() => {
  return {
    title: String(route.params.id),
  };
});

// Validate response
const BoardSchema = v.object({
  title: v.string(),
  created_at: v.string(),
  id: v.number(),
  project_id: v.number(),
  tasks: v.array(
    v.object({
      id: v.number(),
      title: v.string(),
      description: v.string(),
      priority: v.string(),
    }),
  ),
  columns: v.array(
    v.object({
      id: v.number(),
      title: v.string(),
    }),
  ),
});

const { data } = useQuery({
  queryKey: ["project" + route.params.id],
  queryFn: async (): Promise<Board> => {
    const res = await $fetch<ServerResponseSucceed<Board>>(
      `/api/board/board?project_id=${route.params.id}`,
      {
        method: "GET",
      },
    );

    if (res.statusCode !== 200) {
      return [] as unknown as Board;
    }

    const validated = v.safeParse(BoardSchema, res.data);
    if (!validated.success) {
      console.error("Validation failed:", validated.issues);
      throw new Error("Invalid API response format");
    }
    return validated.output;
  },

  enabled: !!route.params.id,
  staleTime: 10 * 60 * 1000,
});

const { onError } = useOnError();
const onSubmitColumn = (title: string) => {
  const validated = v.safeParse(
    v.pipe(
      v.string(),
      v.minLength(5, "Must be greater than 5 character"),
      v.maxLength(20, "Must be less than 20 Characters"),
    ),
    title,
  );
  if (!validated.success) {
    onError({ errors: validated.issues });
    return;
  }

  submitColumn(validated.output);
};

const queryClient = useQueryClient();
const { manualError, manualSucceed } = useOnError();
const { isPending, mutate: submitColumn } = useMutation({
  mutationFn: async (title: string): Promise<Columns> => {
    const res = await $fetch<ServerResponseSucceed<Columns>>(
      "/api/column/column",
      {
        method: "post",
        body: {
          board_id: data.value?.id,
          title: title,
        },
      },
    );

    if (res.statusCode !== 200) {
      throw new Error("Failed to retrieve");
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

    queryClient.invalidateQueries({ queryKey: ["project" + route.params.id] });
    toggleModal.value = false;
  },
});
</script>

<style lang="scss" scoped></style>
