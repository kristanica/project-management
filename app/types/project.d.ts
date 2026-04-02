type Project = {
  title: string;
  description: string;
};

type ProjectResponse = {
  title: string;
  data: {
    title: string;
    description: string;
    id: string;
    status: string;
  }[];
  pages: number;
  statusCode: number;
};

type ProjectReturn = {
  projectList: {
    title: string;
    description: string;
    id: string;
    status: string;
  }[];

  totalPages: number;
};

type ProjectResponse = {
  data: ProjectReturn[];
  statusCode: number;
  title: string;
  pages: number;
};
