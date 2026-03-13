import { useToast } from "@/components/ui/toast";

export function useSnackbar() {
  const { toast } = useToast();

  const enqueueSnackbar = (
    message: string,
    config?: { variant?: "success" | "error"; autoHideDuration?: number }
  ) => {
    toast(message, {
      variant: config?.variant,
      duration: config?.autoHideDuration,
    });
  };

  return { enqueueSnackbar };
}
