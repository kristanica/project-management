type Columns = {
  id: number;
  title: string;
  order: number;
  tasks: Task[];
};

type AddColumnToBoard = {
  // title is passed directly to mutation, pero just incase
  title?: string | undefined;
  // boardId: number | undefined;
  projectId: number | undefined;
};
