export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  STUDENT = 3,
  TEACHER = 4,
  STAFF = 5,
  ACCOUNTANT = 6,
  PARENT = 7,
}

export type Role = {
  id: number | string;
  name?: string;
};
