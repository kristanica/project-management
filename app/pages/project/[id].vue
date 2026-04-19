<template>
  <div class="flex flex-col h-full min-h-[calc(100vh-4rem)]">
    <Header
      v-if="boardData"
      :title="boardData.title"
      @open-modal="openModal"
    ></Header>
    <div v-else class="flex flex-col items-center justify-center flex-1 py-20">
      <UIcon
        name="i-lucide-loader-2"
        class="size-10 animate-spin text-primary-500 mb-4"
      />
      <p class="text-gray-500 font-medium">Loading board...</p>
    </div>

    <ClientOnly>
      <VueDraggable
        @end="onDragColumn"
        v-if="boardDataBind?.columns"
        v-model="boardDataBind.columns"
        class="flex flex-row gap-6 mt-5 items-start overflow-x-auto pb-4 flex-1"
        item-key="id"
        :animation="300"
        group="columns"
      >
        <div
          :key="column.id"
          class="w-80 min-w-80 shrink-0 flex flex-col border rounded-xl p-3 bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 max-h-[calc(100vh-12rem)]"
          v-for="column in boardDataBind.columns"
        >
          <div
            class="rounded-lg p-3 text-white shadow-sm flex items-center justify-between mb-3"
            :style="{ backgroundColor: column.color }"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-lightbulb" class="size-5" />
              <h1 class="text-lg font-bold">
                {{ column.title }}
              </h1>
            </div>
            <UButton
              icon="i-lucide-trash"
              size="sm"
              variant="ghost"
              class="opacity-75 hover:opacity-100"
              @click="openDeleteModal(column.id, 'column')"
            />
          </div>

          <div
            class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pr-1"
          >
            <VueDraggable
              v-model="column.tasks"
              class="flex flex-col gap-2 min-h-8"
              :animation="300"
              item-key="id"
              group="tasks"
              :data-column-id="column.id"
              @end="onDragTask"
            >
              <div
                class="group relative cursor-move bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex flex-col gap-2 hover:border-primary-500 transition-colors"
                :key="task.id"
                v-for="task in column.tasks"
                :data-task-id="task.id"
                :data-task-order="task.order"
                :data-task-title="task.title"
              >
                <UButton
                  icon="i-lucide-trash"
                  size="xs"
                  variant="ghost"
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="openDeleteModal(task.id, 'task')"
                />

                <div>
                  <h1 class="text-base font-semibold pr-6">
                    {{ task.title }}
                  </h1>
                  <p
                    class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                  >
                    {{ task.description }}
                  </p>
                </div>

                <div class="flex items-center gap-2 mt-2">
                  <UBadge size="xs">{{ task.priority }}</UBadge>
                  <UBadge size="xs" variant="solid">{{ task.status }}</UBadge>
                </div>
              </div>
            </VueDraggable>

            <div
              v-if="!column.tasks || column.tasks.length === 0"
              class="text-gray-400 text-sm text-center italic py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg mt-2"
            >
              No tasks yet
            </div>
          </div>

          <UButton
            variant="ghost"
            class="w-full flex items-center justify-center mt-3 border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
        </div>
      </VueDraggable>
    </ClientOnly>
  </div>

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
          Create a new task for the column:
          <i>{{ selectedColumn.title }} </i>
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
        <h1 class="text-xl font-bold">Delete</h1>
        <p class="text-sm">Are you sure u want to delete this</p>
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
import {
  VueDraggable,
  type DraggableEvent,
  type SortableEvent,
} from "vue-draggable-plus";
import useReorderColumn from "~/composables/mutations/useReorderColumn";
import useDeleteColumn from "~/composables/mutations/useDeleteColumn";
import useDeleteTask from "~/composables/mutations/useDeleteTask";
import useOrderTask from "~/composables/mutations/useOrderTask";

// --- Types ---
type SelectedColumn = {
  columnTitle: string;
  columnId: number;
  boardId: number;
};

// --- Composables ---
const route = useRoute();
const { onError } = useOnError();

// --- State (Refs & Reactives) ---
const boardDataBind = ref<Board>();
const toggleAddColumnModal = ref<boolean>(false);
const toggleAddTaskModal = ref<boolean>(false);
const toggleDeleteModal = ref<boolean>(false);

const selectedColumn = reactive({
  title: "",
  columnId: 0,
  boardId: 0,
});

const deleteObject = reactive<{
  id: number;
  type: "column" | "task";
}>({
  id: 0,
  type: "column",
});

// --- Computed ---
const projectId = computed(() => Number(route.params.id) || 0);

// --- Queries & Mutations ---
const { data: boardData } = useQuery(useFetchBoard(Number(projectId.value)));

const order = computed(() => boardData.value?.columns.length ?? 0);
const taskorder = computed(() => {
  const column = boardData.value?.columns.find(
    (c) => c.id === selectedColumn.columnId,
  );
  return column?.tasks?.length ?? 0;
});
const boardId = computed(() => boardData.value?.id ?? 0);

const { mutate: addTask, isPending: isTaskPending } = useAddTask(
  Number(projectId.value),
  toggleAddTaskModal,
);

const { mutate: deleteColumn } = useDeleteColumn({
  projectId: Number(projectId.value),
  toggleDeleteModal,
});

const { mutate: deleteTask } = useDeleteTask({
  projectId: Number(projectId.value),
  toggleDeleteModal,
});

const { isPending: isColumnPending, mutate: submitColumn } =
  useAddColumnToBoard({
    projectId: Number(projectId.value),
    toggleAddColumnModal: toggleAddColumnModal,
  });

const reOrderMutation = useReorderColumn(toggleAddTaskModal);
const { mutate: reOrderTask } = useOrderTask();

// --- Watchers ---
watch(
  boardData,
  (value) => {
    if (value) {
      boardDataBind.value = JSON.parse(JSON.stringify(value));
    }
  },
  { immediate: true },
);

// --- Methods ---
const openModal = () => {
  toggleAddColumnModal.value = true;
};

const openTaskModal = ({ columnTitle, columnId, boardId }: SelectedColumn) => {
  selectedColumn.title = columnTitle;
  selectedColumn.columnId = columnId;
  selectedColumn.boardId = boardId;
  toggleAddTaskModal.value = true;
};

const openDeleteModal = (id: number, type: "column" | "task") => {
  deleteObject.id = id;
  deleteObject.type = type;
  toggleDeleteModal.value = true;
};

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

    // TMP
    order: taskorder.value,
  });
};

const onSubmitDeleteColumn = () => {
  if (deleteObject.type === "column") {
    deleteColumn(deleteObject.id);
    return;
  }

  if (deleteObject.type === "task") {
    deleteTask(deleteObject.id);
    return;
  }
};

// Draggable Events
const onDragColumn = (e: DraggableEvent) => {
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

const onDragTask = (e: SortableEvent) => {
  const taskId = e.item.dataset.taskId;
  const order = e.item.dataset.taskOrder;
  const title = e.item.dataset.taskTitle;

  const fromColumnId = e.from.dataset.columnId;
  const toColumnId = e.to.dataset.columnId;

  const oldOrder = e.oldIndex;
  const newOrder = e.newIndex;

  const from = {
    task_id: Number(taskId),
    order: Number(oldOrder),
    column_id: Number(fromColumnId),
  };

  const to = {
    task_id: Number(taskId),
    order: Number(newOrder),
    column_id: Number(toColumnId),
  };

  reOrderTask({ from: from, to: to });
  console.log(`
Being dragged:
TaskID: ${taskId}
Order: ${order}
Title: ${title}
From Column: ${fromColumnId}
To: Column: ${toColumnId}

oldOrder: ${oldOrder} 
newOrder: ${newOrder}

`);
};

// --- Lifecycle & Meta ---
useHead(() => {
  return {
    title: String(projectId.value),
  };
});
</script>

<style lang="scss" scoped></style>
