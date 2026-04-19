type Success<T> = [T, undefined];
type Fail<E = Error> = [undefined, E];
type Return<T, E = Error> = Success<T> | Fail<E>;

export const tryCatch = async <T, E = Error>(
  promise: Promise<T>,
): Promise<Return<T, E>> => {
  try {
    const tmp = await promise;
    return [tmp, undefined];
  } catch (e) {
    return [undefined, e as E];
  }
};
