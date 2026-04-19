type Task = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  order: number;
};

type AddTask = Omit<Task, "id">;
