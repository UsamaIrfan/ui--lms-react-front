import { Spinner } from "@/components/ui/spinner";

type FullPageLoaderType = {
  isLoading: boolean;
};

export function FullPageLoader({ isLoading }: FullPageLoaderType) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-white-0/80 backdrop-blur-sm">
      <Spinner size="lg" />
    </div>
  );
}
