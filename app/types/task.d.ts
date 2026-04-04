type Task = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
};

type AddTask = Omit<Task, "id">;
