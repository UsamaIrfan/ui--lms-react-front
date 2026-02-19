import { RoleEnum } from "../api/types/role";

/**
 * Returns the default route for a given role after sign-in.
 *
 * - ADMIN, TEACHER, STAFF, ACCOUNTANT → /admin-panel
 * - STUDENT, PARENT → /student-portal
 * - USER (generic) → /profile
 */
export function getDefaultRouteForRole(
  roleId: number | string | undefined,
  language: string
): string {
  switch (Number(roleId)) {
    case RoleEnum.ADMIN:
    case RoleEnum.TEACHER:
    case RoleEnum.STAFF:
    case RoleEnum.ACCOUNTANT:
      return `/${language}/admin-panel`;
    case RoleEnum.STUDENT:
    case RoleEnum.PARENT:
      return `/${language}/student-portal`;
    case RoleEnum.USER:
    default:
      return `/${language}/profile`;
  }
}
