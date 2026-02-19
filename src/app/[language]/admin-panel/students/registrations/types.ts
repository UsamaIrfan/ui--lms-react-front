export enum EnrollmentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  GRADUATED = "graduated",
  TRANSFERRED = "transferred",
  DROPPED = "dropped",
  SUSPENDED = "suspended",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum BloodGroup {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-",
}

export const DOCUMENT_TYPES = [
  "birth_certificate",
  "previous_school_certificate",
  "address_proof",
  "photo_id",
  "medical_record",
  "passport",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const GUARDIAN_RELATIONS = [
  "father",
  "mother",
  "guardian",
  "uncle",
  "aunt",
  "grandparent",
  "sibling",
  "other",
] as const;

export type GuardianRelation = (typeof GUARDIAN_RELATIONS)[number];

export interface Student {
  id: number;
  userId: number;
  institutionId: number;
  rollNumber: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  guardianRelation: string | null;
  address: string | null;
  city: string | null;
  bloodGroup: BloodGroup | null;
  nationality: string | null;
  religion: string | null;
  admissionDate: string | null;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  photo?: string;
  tenantId: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
  // Populated via joins
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  enrollments?: StudentEnrollment[];
  className?: string;
  sectionName?: string;
}

export interface StudentEnrollment {
  id: number;
  studentId: number;
  sectionId: number;
  academicYearId: number;
  status: EnrollmentStatus;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  // Populated
  sectionName?: string;
  className?: string;
  academicYearName?: string;
}

export interface StudentDocument {
  id: number;
  studentId: number;
  documentType: string;
  fileId: string | null;
  isVerified: boolean;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated
  filePath?: string;
  fileName?: string;
}

export interface StudentGuardian {
  id: number;
  studentId: number;
  name: string;
  phone: string;
  email: string | null;
  relation: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface FeeRecord {
  id: number;
  challanNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  paidDate?: string;
}

export interface ExamRecord {
  id: number;
  examName: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  grade?: string;
  percentage: number;
  date: string;
}

export interface ActivityLogEntry {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  performedBy?: string;
}

export interface StudentFilterType {
  search?: string;
  status?: EnrollmentStatus;
  institutionId?: number;
  classId?: string;
  sectionId?: string;
}

export interface StudentSortType {
  order: "ASC" | "DESC";
  orderBy: keyof Student;
}

export interface ImportResult {
  imported: number;
  errors: Array<{ row: number; message: string }>;
}
