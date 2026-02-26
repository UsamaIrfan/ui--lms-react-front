import { useQuery } from "@tanstack/react-query";
import { portalsControllerGetStudentDashboardV1 } from "@/services/api/generated/portals/portals";

/**
 * Lightweight hook that checks whether the logged-in student has an
 * active class/section enrollment.  Uses the portals dashboard endpoint
 * (which React Query will cache) so subsequent calls are essentially free.
 */
export function useStudentEnrollment() {
  return useQuery({
    queryKey: ["student-enrollment-check"],
    queryFn: async ({ signal }) => {
      const res = await portalsControllerGetStudentDashboardV1(undefined, {
        signal,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any)?.data;
      const className: string = data?.student?.gradeClass?.name ?? "";
      const sectionName: string = data?.student?.section?.name ?? "";
      return {
        isEnrolled: !!className,
        className,
        sectionName,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
