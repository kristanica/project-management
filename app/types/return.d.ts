type ServerResponseSucceed<T> = {
  data: T;
  statusCode: number | string;
  title: string;
  pages?: number;
};

type ServerResponseFail = {
  title: string;
  statusCode: string;
  data: string;
};
