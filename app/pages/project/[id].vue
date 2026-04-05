<template>
  <div>
    <Header
      v-if="boardData"
      :title="boardData?.title"
      @open-modal="openModal"
    ></Header>
    <div v-else>Loading...</div>
  </div>

  <ClientOnly>
    <draggable
      :v-model="boardDataBind ?? []"
      tag="transition-group"
      class="flex gap-6 items-start overflow-x-auto pb-4 w-full"
      :component-data="{
        tag: 'div',
        type: 'transition',
        name: 'fade',
      }"
      :animation="200"
    >
      <UCard
        v-for="column in boardDataBind?.columns ?? []"
        :key="column.id"
        class="min-w-[300px] w-[300px] flex-shrink-0"
      >
        <template #header>
          {{ column.title }}
        </template>

        <div
          v-if="column.tasks?.length > 0"
          v-for="task in column.tasks"
          class="my-2 cursor-move"
          :key="task.id"
        >
          <UCard>
            <template #header>
              <h1>{{ task.title }}</h1>
            </template>

            <h1>{{ task.description }}</h1>

            <template #footer>
              {{ task.priority }}
              {{ task.status }}
            </template>
          </UCard>
        </div>

        <div v-else class="text-gray-400 text-sm italic py-2">No tasks yet</div>

        <template #footer>
          <UButton
            class="w-full flex items-center justify-center"
            @click="
              openTaskModal({
                columnTitle: column.title,
                boardId: boardDataBind?.id || 0,
                columnId: column.id,
              })
            "
          >
            Add a task
          </UButton>
        </template>
      </UCard>
    </draggable>
  </ClientOnly>

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
import { useQuery } from "@tanstack/vue-query";
import Header from "~/components/Board/header.vue";
import * as v from "valibot";
import Addcolumnform from "~/components/Board/addcolumnform.vue";

import { TaskSchema } from "~/../schema/task.schema";
import { useFetchBoard } from "~/composables/queries/useFetchBoard";
import { useAddColumnToBoard } from "~/composables/queries/useAddColumnToBoard";
import Addtaskfrom from "~/components/Board/addtaskfrom.vue";
import { useAddTask } from "~/composables/queries/useAddTask";
import { VueDraggableNext as draggable } from "vue-draggable-next";

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

  addTask({
    ...validated.output,
    columnId: selectedColumn.columnId,
    boardId: selectedColumn.boardId,
    projectId: Number(projectId.value),
  });
};

const { mutate: addTask, isPending: isTaskPending } = useAddTask(
  Number(projectId.value),
);

const boardDataBind = ref<Board>();

watch(boardData, () => {
  if (boardData.value) {
    console.log("hellO!");
    boardDataBind.value = boardData.value;
  }
});
</script>

<style lang="scss" scoped>
.fade-item {
  padding: 15px;
  margin: 8px 0;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
