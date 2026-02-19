export enum EnquiryStatus {
  NEW = "new",
  CONTACTED = "contacted",
  SCHEDULED_VISIT = "scheduled_visit",
  VISIT_DONE = "visit_done",
  APPLIED = "applied",
  ACCEPTED = "accepted",
  ENROLLED = "enrolled",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

export enum EnquirySource {
  WALK_IN = "walk_in",
  PHONE = "phone",
  WEBSITE = "website",
  REFERRAL = "referral",
  SOCIAL_MEDIA = "social_media",
  ADVERTISEMENT = "advertisement",
  OTHER = "other",
}

export interface AdmissionEnquiry {
  id: number;
  studentName: string;
  guardianName: string | null;
  phone: string | null;
  email: string | null;
  previousSchool: string | null;
  gradeApplyingFor: string | null;
  status: EnquiryStatus;
  source: EnquirySource;
  notes: string | null;
  followUpDate: string | null;
  convertedStudentId: number | null;
  institutionId: number;
  tenantId: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: number;
  enquiryId: number;
  note: string;
  nextFollowUpDate: string | null;
  createdAt: string;
  createdBy: string;
}

export interface EnquiryFilterType {
  status?: EnquiryStatus;
  source?: EnquirySource;
  search?: string;
}

export interface EnquirySortType {
  order: "ASC" | "DESC";
  orderBy: keyof AdmissionEnquiry;
}
