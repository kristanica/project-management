export default function useOnError() {
  const toast = useToast();
  const onError = (e: any) => {
    const firstError = e.errors[0];
    toast.add({
      title: "Validation Error",
      description: firstError.message,
      color: "error",
    });
  };

  return {
    onError,
  };
}
