// ─────────────────────────────────────────────
// Student Fees Page Types
// ─────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "online"
  | "cheque"
  | "card";

export type ConcessionType =
  | "scholarship"
  | "sibling"
  | "staff_child"
  | "merit"
  | "financial_aid";

export type FeeFrequency =
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "one_time";

// ── API Response Shapes ──

export interface FeeChallan {
  id: number;
  challanNumber: string;
  studentId: number;
  feeStructureId: number;
  amount: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: PaymentStatus;
  feeStructure?: {
    id: number;
    name: string;
    amount: number;
    frequency?: FeeFrequency;
    description?: string;
  };
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    studentId: string;
    gradeClass?: { name: string };
    section?: { name: string };
  };
  payments?: FeePaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface FeePaymentRecord {
  id: number;
  challanId: number;
  amount: number;
  method: PaymentMethod;
  transactionRef?: string;
  paidAt: string;
  verified: boolean;
  receiptNumber?: string;
  remarks?: string;
  createdAt: string;
}

export interface FeeConcession {
  id: number;
  studentId: number;
  type: ConcessionType;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  reason?: string;
  createdAt: string;
}

export interface FeeStructureDetail {
  id: number;
  name: string;
  amount: number;
  frequency?: FeeFrequency;
  description?: string;
  installments?: FeeInstallment[];
}

export interface FeeInstallment {
  index: number;
  dueDate: string;
  amount: number;
}

// ── Aggregated Page Data ──

export interface StudentFeesPageData {
  challans: FeeChallan[];
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  nextDueDate?: string;
  nextDueAmount?: number;
  concession: FeeConcession | null;
}

export type FeesTab = "overview" | "challans" | "payments" | "concession";
