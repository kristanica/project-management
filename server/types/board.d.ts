type Board = {
  colums: Columns[];
  created_at: Date;
  id: number;
  project_id: number;
  tasks: Omit<Task, "column_id", "project_id", "board_id">[];
  title: string;
};
