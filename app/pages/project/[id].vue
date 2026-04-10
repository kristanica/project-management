<template>
  <div>
    <Header
      v-if="boardData"
      :title="String(boardData?.id)"
      @open-modal="openModal"
    ></Header>
    <div v-else>Loading...</div>
  </div>

  <ClientOnly>
    <VueDraggable
      @end="test"
      v-if="boardDataBind?.columns"
      v-model="boardDataBind.columns"
      class="flex flex-row gap-5 mt-5"
      item-key="id"
      :animation="300"
    >
      <div
        :key="column.id"
        class="min-w-75 w-contain border rounded-md p-3 border-muted"
        v-for="column in boardDataBind.columns"
      >
        <h1 class="text-2xl font-bold text-center my-2">
          <UIcon name="i-lucide-lightbulb" class="size-5" />
          {{ column.title }}
        </h1>

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

        <VueDraggable
          v-if="column.tasks"
          v-model="column.tasks"
          class="flex flex-col"
          :animation="300"
          item-key="id"
        >
          <div
            class="my-2 cursor-move bg-white/15 p-2 rounded"
            :key="task.id"
            v-for="task in column.tasks"
          >
            <div>
              <div>
                <h1 class="leading-4 text-xl font-bold">{{ task.title }}</h1>
                <p class="leading-4">{{ task.description }}</p>
              </div>

              <div>
                {{ task.priority }}
                {{ task.status }}
              </div>
            </div>
          </div>
        </VueDraggable>

        <div v-else class="text-gray-400 text-sm italic py-2">No tasks yet</div>
      </div>
    </VueDraggable>
  </ClientOnly>

  <UModal :dismissible="true" v-model:open="toggleAddColumnModal">
    <template #header>
      <div class="block">
        <h1 class="text-xl font-bold">Create a new Column</h1>
        <p class="text-sm">
          Create a new Column for the board:
          <i>{{ boardData?.title }}</i>
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
import { ref, reactive, computed, watch } from "vue";
import { useRoute } from "vue-router";
import Header from "~/components/Board/header.vue";
import * as v from "valibot";
import Addcolumnform from "~/components/Board/addcolumnform.vue";
import { TaskSchema } from "~/../schema/task.schema";
import { useFetchBoard } from "~/composables/queries/useFetchBoard";
import { useAddColumnToBoard } from "~/composables/queries/useAddColumnToBoard";
import Addtaskfrom from "~/components/Board/addtaskfrom.vue";
import { useAddTask } from "~/composables/queries/useAddTask";
import { VueDraggable, type DraggableEvent } from "vue-draggable-plus";

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

const boardDataBind = ref<Board>();
// Computations
const projectId = computed(() => Number(route.params.id) || 0);
const { data: boardData } = useQuery(useFetchBoard(Number(projectId.value)));

watch(
  boardData,
  (value) => {
    if (value) {
      boardDataBind.value = JSON.parse(JSON.stringify(value));
    }
  },
  { immediate: true },
);

const { onError } = useOnError();

const order = computed(() => boardData.value?.columns.length ?? 0);
const boardId = computed(() => boardData.value?.id ?? 0);
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
  submitColumn({
    title: validated.output,
    board_id: boardId.value,
    order: order.value,
  });
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

const { isPending: isColumnPending, mutate: submitColumn } =
  useAddColumnToBoard({
    projectId: Number(projectId.value),

    toggleAddColumnModal: toggleAddColumnModal,
  });

const test = (e: DraggableEvent) => {
  if (e.oldIndex == null || e.newIndex == null) return;
  if (!boardData.value || boardData.value?.columns.length === 0) return;

  const oldTmp = boardData.value.columns[e.oldIndex];
  const newTmp = boardData.value.columns[e.newIndex];

  const oldCol = {
    id: oldTmp?.id,
    order: newTmp?.order,
    title: newTmp?.title,
  };

  const newCol = {
    id: newTmp?.id,
    order: oldTmp?.order,
    title: oldTmp?.title,
  };
  boardDataBind.value?.columns?.forEach((column, index) => {
    console.log(
      column.id,
      "new index:",
      index,
      "current order:",
      column.order,
      "title:",
      column.title,
    );
  });
};

useHead(() => {
  return {
    title: String(projectId.value),
  };
});
</script>

<style lang="scss" scoped></style>
