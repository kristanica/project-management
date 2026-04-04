export default function useOnError() {
  const toast = useToast();

  // use for forms
  const onError = (e: any) => {
    const firstError = e.errors[0];
    toast.add({
      title: "Validation Error",
      description: firstError.message,
      color: "error",
      duration: 1000 * 2,
    });
  };

  // manual call
  const manualError = (error: string) => {
    toast.add({
      title: "Validation Error",
      description: error,
      color: "error",
      duration: 1000 * 2,
    });

    // bat nandito to?
  };
  const manualSucceed = (succeed: string) => {
    toast.add({
      title: "Success",
      description: succeed,
      color: "success",
      duration: 1000 * 2,
    });
  };
  return {
    onError,
    manualError,
    manualSucceed,
  };
}
