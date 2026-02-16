import { Spinner } from "@/components/ui/spinner";

function Loading() {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <Spinner size="lg" />
    </div>
  );
}

export default Loading;
