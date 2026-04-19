<template>
  <div>
    <Header
      v-if="boardData"
      :title="boardData.title"
      @open-modal="openModal"
    ></Header>
    <div v-else>Loading...</div>
  </div>

  <ClientOnly>
    <VueDraggable
      @end="test"
      v-if="boardDataBind?.columns"
      v-model="boardDataBind.columns"
      class="flex flex-row gap-6 mt-5 items-start overflow-x-auto pb-4"
      item-key="id"
      :animation="300"
    >
      <div
        :key="column.id"
        class="w-80 min-w-80 shrink-0 h-fit flex flex-col gap-3 border rounded-xl p-3 bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
        v-for="column in boardDataBind.columns"
      >
        <div
          class="rounded-lg p-3 text-white shadow-sm flex items-center justify-between"
          :style="{ backgroundColor: column.color }"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-lightbulb" class="size-5" />
            <h1 class="text-lg font-bold">{{ column.title }}</h1>
          </div>
          <UButton
            icon="i-lucide-trash"
            size="sm"
            color="info"
            variant="ghost"
            class="opacity-75 hover:opacity-100"
            @click="openDeleteModal(column.id)"
          />
        </div>

        <UButton
          variant="soft"
          class="w-full flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600"
          @click="
            openTaskModal({
              columnTitle: column.title,
              boardId: boardDataBind?.id || 0,
              columnId: column.id,
            })
          "
        >
          <UIcon name="i-lucide-plus" class="size-4 mr-1" />
          Add a task
        </UButton>

        <VueDraggable
          v-if="column.tasks"
          v-model="column.tasks"
          class="flex flex-col gap-2"
          :animation="300"
          item-key="id"
        >
          <div
            class="relative cursor-move bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex flex-col gap-2 hover:border-primary-500 transition-colors"
            :key="task.id"
            v-for="task in column.tasks"
          >
            <UButton
              icon="i-lucide-trash"
              size="sm"
              color="info"
              variant="ghost"
              class="absolute top-2 right-2 opacity-75 hover:opacity-100"
            />

            <div>
              <h1 class="text-base font-semibold">{{ task.title }}</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ task.description }}
              </p>
            </div>

            <div class="flex items-center gap-2 mt-2">
              <UBadge size="xs">{{ task.priority }}</UBadge>
              <UBadge size="xs" variant="solid">{{ task.status }}</UBadge>
            </div>
          </div>
        </VueDraggable>

        <div v-else class="text-gray-400 text-sm text-center italic py-4">
          No tasks yet
        </div>
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
        <h1 class="text-xl font-bold">Create a new task</h1>
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

  <UModal :dismissible="true" v-model:open="toggleDeleteModal">
    <template #header>
      <div class="block">
        <h1 class="text-xl font-bold">Delete Column {{ deleteColumnId }}</h1>
        <p class="text-sm">Are you sure u want to delete this column?</p>
      </div>
    </template>

    <template #footer>
      <UButton
        label="Confirm"
        color="success"
        class="w-1/2 flex items-center justify-center"
        @click="onSubmitDeleteColumn"
      ></UButton>
      <UButton
        label="Decline"
        color="error"
        class="w-1/2 flex items-center justify-center"
        @click="toggleDeleteModal = false"
      ></UButton>
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
import { useAddColumnToBoard } from "~/composables/mutations/useAddColumnToBoard";
import Addtaskfrom from "~/components/Board/addtaskfrom.vue";
import { useAddTask } from "~/composables/mutations/useAddTask";
import { VueDraggable, type DraggableEvent } from "vue-draggable-plus";
import useReorderColumn from "~/composables/mutations/useReorderColumn";
import useDeleteColumn from "~/composables/mutations/useDeleteColumn";

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
const onSubmitColumn = (title: string, color: string) => {
  const validated = v.safeParse(
    v.object({
      title: v.pipe(
        v.string(),
        v.minLength(5, "Must be greater than 5 character"),
        v.maxLength(20, "Must be less than 20 Characters"),
      ),
      color: v.string(),
    }),
    { title, color },
  );

  if (!validated.success) {
    onError({ errors: validated.issues });
    return;
  }
  submitColumn({
    title: validated.output.title,
    color: validated.output.color,

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
  toggleAddTaskModal,
);

const deleteColumnId = ref<number>(0);
const toggleDeleteModal = ref<boolean>(false);

const openDeleteModal = (id: number) => {
  deleteColumnId.value = id;
  toggleDeleteModal.value = true;
};
const onSubmitDeleteColumn = () => {
  console.log(deleteColumnId.value);
  deleteColumn(deleteColumnId.value);
};
const { mutate: deleteColumn } = useDeleteColumn({
  projectId: Number(projectId.value),
  toggleDeleteModal,
});

const { isPending: isColumnPending, mutate: submitColumn } =
  useAddColumnToBoard({
    projectId: Number(projectId.value),

    toggleAddColumnModal: toggleAddColumnModal,
  });

const reOrderMutation = useReorderColumn(toggleAddTaskModal);

const test = (e: DraggableEvent) => {
  if (e.oldIndex == null || e.newIndex == null) return;
  if (e.oldIndex === e.newIndex) return;
  if (!boardData.value || boardData.value?.columns.length === 0) return;

  const oldTmp = boardData.value.columns[e.oldIndex];
  const newTmp = boardData.value.columns[e.newIndex];

  const oldCol = {
    id: oldTmp?.id || 0,
    order: newTmp?.order || 0,
    title: newTmp?.title || 0,
  };

  const newCol = {
    id: newTmp?.id || 0,
    order: oldTmp?.order || 0,
    title: oldTmp?.title || 0,
  };
  reOrderMutation.mutate({ oldCol: oldCol, newCol: newCol });
};

useHead(() => {
  return {
    title: String(projectId.value),
  };
});
</script>

<style lang="scss" scoped></style>
