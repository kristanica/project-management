<template>
  <div>
    <Header
      v-if="boardData"
      :title="boardData?.title"
      @open-modal="openModal"
    ></Header>
    <div v-else>Loading...</div>
  </div>

  <div :class="['grid gap-5 mt-5', `grid-cols-5 }`]">
    <UCard v-for="column in boardData?.columns">
      <template #header :key="column.id">
        {{ column.title }}
      </template>

      <h1>body!</h1>

      <template #footer>
        <UButton
          class="w-full flex items-center justify-center"
          @click="
            openTaskModal({
              columnTitle: column.title,
              boardId: boardData?.id || 0,
              columnId: column.id,
            })
          "
          >Add a task</UButton
        >
      </template>
    </UCard>
  </div>

  <UModal :dismissible="true" v-model:open="toggleAddColumnModal">
    <template #header>
      <div class="block">
        <h1 class="text-xl font-bold">Create a new Column</h1>
        <p class="text-sm">
          Create a new Column for the board: <i>{{ boardData?.title }}</i>
        </p>
      </div>
    </template>
    <template #body>
      <Addcolumnform
        :isColumnPending="isColumnPending"
        @on-submit="onSubmitColumn"
      ></Addcolumnform>
    </template>
  </UModal>

  <UModal :dismissible="true" v-model:open="toggleAddTaskModal">
    <template #header>
      <div class="block">
        <h1 class="text-xl font-bold">Create a new Column</h1>
        <p class="text-sm">
          Create a new task for the column: <i>{{ selectedColumn.title }}</i>
        </p>
      </div>
    </template>
    <template #body>
      <Addtaskfrom
        :isTaskPending="isTaskPending"
        @on-submit="onSubmitTask"
      ></Addtaskfrom>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import Header from "~/components/Board/header.vue";
import * as v from "valibot";
import Addcolumnform from "~/components/Board/addcolumnform.vue";

import { TaskSchema } from "~/../schema/task.schema";
import { useFetchBoard } from "~/composables/queries/useFetchBoard";
import { useAddColumnToBoard } from "~/composables/queries/useAddColumnToBoard";
import Addtaskfrom from "~/components/Board/addtaskfrom.vue";
import { useAddTask } from "~/composables/queries/useAddTask";

type SelectedColumn = {
  columnTitle: string;
  columnId: number;
  boardId: number;
};

const route = useRoute();
const selectedColumn = reactive({
  title: "",
  columnId: 0,
  boardId: 0,
});
const toggleAddColumnModal = ref<boolean>(false);
const toggleAddTaskModal = ref<boolean>(false);

const openModal = () => {
  toggleAddColumnModal.value = true;
};
const openTaskModal = ({ columnTitle, columnId, boardId }: SelectedColumn) => {
  selectedColumn.title = columnTitle;
  selectedColumn.columnId = columnId;
  selectedColumn.boardId = boardId;
  toggleAddTaskModal.value = true;
};

const projectId = computed(() => Number(route.params.id) || "");

useHead(() => {
  return {
    title: String(projectId.value),
  };
});

const { data: boardData } = useQuery(useFetchBoard(Number(projectId.value)));
const {
  isPending: isColumnPending,
  mutate: submitColumn,
  data: columnResponse,
} = useAddColumnToBoard({
  boardId: boardData.value?.id,
  projectId: Number(projectId.value),
  toggleAddColumnModal: toggleAddColumnModal,
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

const onSubmitTask = (form: AddTask) => {
  const validated = v.safeParse(TaskSchema, form);
  if (!validated.success) {
    onError({ erros: validated.issues });
    return;
  }

  addTask({ ...validated.output });
};

const { mutate: addTask, isPending: isTaskPending } = useAddTask({
  columnId: selectedColumn.columnId,
  boardId: selectedColumn.boardId,
  projectId: Number(projectId.value),
});
</script>

<style lang="scss" scoped></style>
