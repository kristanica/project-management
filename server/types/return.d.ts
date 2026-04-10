type ServerResponseSucceed<T> = {
  data: T | null;
  statusCode: number;
  title: string;
  // If response must be paginated
  pages?: number;
};

type ServerResponseFail = {
  title: string;
  statusCode: number;
  data: T;
};
