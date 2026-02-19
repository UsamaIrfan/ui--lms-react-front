"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/services/i18n/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RiUserLine,
  RiBookLine,
  RiFileTextLine,
  RiParentLine,
  RiAddLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCalendarLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiFileListLine,
  RiTimeLine,
} from "@remixicon/react";
import {
  useStudentDetailQuery,
  useStudentDocumentsQuery,
  useStudentGuardiansQuery,
} from "../queries/queries";
import { StatusBadge } from "./status-badge";
import EnrollStudentModal from "./enroll-student-modal";
import UploadDocumentModal from "./upload-document-modal";
import AddGuardianModal from "./add-guardian-modal";
import type {
  Student,
  StudentEnrollment,
  StudentDocument,
  StudentGuardian,
} from "../types";

type TabId =
  | "profile"
  | "enrollment"
  | "documents"
  | "guardians"
  | "attendance"
  | "fees"
  | "exams"
  | "activity";

const TABS: TabId[] = [
  "profile",
  "enrollment",
  "documents",
  "guardians",
  "attendance",
  "fees",
  "exams",
  "activity",
];

const TAB_ICONS: Record<TabId, typeof RiUserLine> = {
  profile: RiUserLine,
  enrollment: RiBookLine,
  documents: RiFileTextLine,
  guardians: RiParentLine,
  attendance: RiBarChartLine,
  fees: RiMoneyDollarCircleLine,
  exams: RiFileListLine,
  activity: RiTimeLine,
};

interface StudentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  onEdit?: (student: Student) => void;
}

export default function StudentDetailModal({
  open,
  onOpenChange,
  studentId,
  onEdit,
}: StudentDetailModalProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [guardianModalOpen, setGuardianModalOpen] = useState(false);

  const { data: student, isLoading: studentLoading } = useStudentDetailQuery(
    studentId ?? 0
  );
  const { data: documents, isLoading: docsLoading } = useStudentDocumentsQuery(
    studentId ?? 0
  );
  const { data: guardians, isLoading: guardiansLoading } =
    useStudentGuardiansQuery(studentId ?? 0);

  const handleEdit = useCallback(() => {
    if (student && onEdit) {
      onEdit(student as Student);
    }
  }, [student, onEdit]);

  if (!studentId) return null;

  const studentData = student as Student | undefined;
  const studentName = studentData
    ? `${studentData.firstName ?? ""} ${studentData.lastName ?? ""}`.trim()
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {t("admin-panel-students-registrations:detail.title")}
            </DialogTitle>
            <DialogDescription>
              {studentName &&
                t("admin-panel-students-registrations:detail.description", {
                  name: studentName,
                })}
            </DialogDescription>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto border-b border-stroke-soft-200 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-label-sm transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-primary-base text-primary-base"
                      : "border-transparent text-text-sub-600 hover:text-text-strong-950"
                  }`}
                >
                  <Icon className="size-4" />
                  {t(`admin-panel-students-registrations:detail.tabs.${tab}`)}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {studentLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : (
              <>
                {activeTab === "profile" && studentData && (
                  <ProfileTab
                    student={studentData}
                    onEdit={onEdit ? handleEdit : undefined}
                  />
                )}
                {activeTab === "enrollment" && studentData && (
                  <EnrollmentTab
                    student={studentData}
                    onEnroll={() => setEnrollModalOpen(true)}
                  />
                )}
                {activeTab === "documents" && (
                  <DocumentsTab
                    documents={(documents as StudentDocument[]) ?? []}
                    loading={docsLoading}
                    onUpload={() => setUploadDocModalOpen(true)}
                  />
                )}
                {activeTab === "guardians" && (
                  <GuardiansTab
                    guardians={(guardians as StudentGuardian[]) ?? []}
                    loading={guardiansLoading}
                    onAdd={() => setGuardianModalOpen(true)}
                  />
                )}
                {activeTab === "attendance" && <AttendanceTab />}
                {activeTab === "fees" && <FeesTab />}
                {activeTab === "exams" && <ExamsTab />}
                {activeTab === "activity" && <ActivityTab />}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <EnrollStudentModal
        open={enrollModalOpen}
        onOpenChange={setEnrollModalOpen}
        studentId={studentId}
        studentName={studentName}
      />

      <UploadDocumentModal
        open={uploadDocModalOpen}
        onOpenChange={setUploadDocModalOpen}
        studentId={studentId}
      />

      <AddGuardianModal
        open={guardianModalOpen}
        onOpenChange={setGuardianModalOpen}
        studentId={studentId}
      />
    </>
  );
}

// ─── Profile Tab ───────────────────────────────────────────

function ProfileTab({
  student,
  onEdit,
}: {
  student: Student;
  onEdit?: () => void;
}) {
  const { t } = useTranslation("admin-panel-students-registrations");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-title-sm text-text-strong-950">
            {student.firstName} {student.lastName}
          </h3>
          {student.studentId && (
            <p className="mt-0.5 text-paragraph-sm text-text-sub-600">
              ID: {student.studentId}
            </p>
          )}
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            {t("admin-panel-students-registrations:actions.edit")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Contact */}
      <div>
        <h4 className="text-label-sm text-text-sub-600 mb-3">
          {t("admin-panel-students-registrations:detail.sections.contact")}
        </h4>
        <div className="grid gap-3">
          {student.email && <InfoRow icon={RiMailLine} value={student.email} />}
          {student.phone && (
            <InfoRow icon={RiPhoneLine} value={student.phone} />
          )}
          {(student.address || student.city) && (
            <InfoRow
              icon={RiMapPinLine}
              value={[student.address, student.city].filter(Boolean).join(", ")}
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Personal Info */}
      <div>
        <h4 className="text-label-sm text-text-sub-600 mb-3">
          {t("admin-panel-students-registrations:detail.sections.personal")}
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.dateOfBirth"
            )}
            value={
              student.dateOfBirth
                ? new Date(student.dateOfBirth).toLocaleDateString()
                : undefined
            }
          />
          <DetailField
            label={t("admin-panel-students-registrations:detail.fields.gender")}
            value={
              student.gender
                ? t(
                    `admin-panel-students-registrations:gender.${student.gender}`
                  )
                : undefined
            }
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.bloodGroup"
            )}
            value={student.bloodGroup ?? undefined}
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.nationality"
            )}
            value={student.nationality ?? undefined}
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.religion"
            )}
            value={student.religion ?? undefined}
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.admissionDate"
            )}
            value={
              student.admissionDate
                ? new Date(student.admissionDate).toLocaleDateString()
                : undefined
            }
          />
        </div>
      </div>

      <Separator />

      {/* Guardian (from registration) */}
      <div>
        <h4 className="text-label-sm text-text-sub-600 mb-3">
          {t("admin-panel-students-registrations:detail.sections.guardian")}
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.guardianName"
            )}
            value={student.guardianName ?? undefined}
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.guardianPhone"
            )}
            value={student.guardianPhone ?? undefined}
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.guardianEmail"
            )}
            value={student.guardianEmail ?? undefined}
          />
          <DetailField
            label={t(
              "admin-panel-students-registrations:detail.fields.guardianRelation"
            )}
            value={
              student.guardianRelation
                ? t(
                    `admin-panel-students-registrations:guardianRelation.${student.guardianRelation}`
                  )
                : undefined
            }
          />
        </div>
      </div>

      {/* Emergency Contact */}
      {(student.emergencyContactName || student.emergencyContactPhone) && (
        <>
          <Separator />
          <div>
            <h4 className="text-label-sm text-text-sub-600 mb-3">
              {t(
                "admin-panel-students-registrations:detail.sections.emergencyContact"
              )}
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailField
                label={t(
                  "admin-panel-students-registrations:detail.fields.emergencyContactName"
                )}
                value={student.emergencyContactName ?? undefined}
              />
              <DetailField
                label={t(
                  "admin-panel-students-registrations:detail.fields.emergencyContactPhone"
                )}
                value={student.emergencyContactPhone ?? undefined}
              />
              <DetailField
                label={t(
                  "admin-panel-students-registrations:detail.fields.emergencyContactRelation"
                )}
                value={student.emergencyContactRelation ?? undefined}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Enrollment Tab ────────────────────────────────────────

function EnrollmentTab({
  student,
  onEnroll,
}: {
  student: Student;
  onEnroll: () => void;
}) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const enrollments = student.enrollments ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-label-sm text-text-sub-600">
          {t(
            "admin-panel-students-registrations:detail.sections.enrollmentHistory"
          )}
        </h4>
        <Button size="sm" onClick={onEnroll}>
          <RiAddLine className="size-4 mr-1" />
          {t("admin-panel-students-registrations:actions.enroll")}
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-stroke-soft-200 p-8 text-center">
          <RiBookLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
          <p className="text-paragraph-sm text-text-sub-600">
            {t("admin-panel-students-registrations:detail.noEnrollments")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment: StudentEnrollment) => (
            <div
              key={enrollment.id}
              className="rounded-lg border border-stroke-soft-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label-sm text-text-strong-950">
                    {enrollment.className ?? `Class ${enrollment.sectionId}`}
                    {enrollment.sectionName && ` - ${enrollment.sectionName}`}
                  </p>
                  {enrollment.academicYearName && (
                    <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                      {enrollment.academicYearName}
                    </p>
                  )}
                </div>
                <StatusBadge status={enrollment.status} />
              </div>
              <div className="flex items-center gap-1 mt-2 text-paragraph-xs text-text-sub-600">
                <RiCalendarLine className="size-3" />
                {new Date(enrollment.enrollmentDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Documents Tab ─────────────────────────────────────────

function DocumentsTab({
  documents,
  loading,
  onUpload,
}: {
  documents: StudentDocument[];
  loading: boolean;
  onUpload: () => void;
}) {
  const { t } = useTranslation("admin-panel-students-registrations");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-label-sm text-text-sub-600">
          {t("admin-panel-students-registrations:detail.sections.documents")}
        </h4>
        <Button size="sm" onClick={onUpload}>
          <RiAddLine className="size-4 mr-1" />
          {t("admin-panel-students-registrations:actions.uploadDocument")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="sm" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-stroke-soft-200 p-8 text-center">
          <RiFileTextLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
          <p className="text-paragraph-sm text-text-sub-600">
            {t("admin-panel-students-registrations:detail.noDocuments")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc: StudentDocument) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-stroke-soft-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <RiFileTextLine className="size-4 text-text-sub-600" />
                <div>
                  <p className="text-label-sm text-text-strong-950">
                    {t(
                      `admin-panel-students-registrations:documentType.${doc.documentType}`
                    )}
                  </p>
                  {doc.remarks && (
                    <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                      {doc.remarks}
                    </p>
                  )}
                </div>
              </div>
              <Badge
                variant={doc.isVerified ? "default" : "outline"}
                className={
                  doc.isVerified ? "bg-success-base text-static-white" : ""
                }
              >
                {doc.isVerified
                  ? t("admin-panel-students-registrations:detail.verified")
                  : t("admin-panel-students-registrations:detail.pending")}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Guardians Tab ─────────────────────────────────────────

function GuardiansTab({
  guardians,
  loading,
  onAdd,
}: {
  guardians: StudentGuardian[];
  loading: boolean;
  onAdd: () => void;
}) {
  const { t } = useTranslation("admin-panel-students-registrations");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-label-sm text-text-sub-600">
          {t("admin-panel-students-registrations:detail.sections.guardians")}
        </h4>
        <Button size="sm" onClick={onAdd}>
          <RiAddLine className="size-4 mr-1" />
          {t("admin-panel-students-registrations:actions.addGuardian")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="sm" />
        </div>
      ) : guardians.length === 0 ? (
        <div className="rounded-lg border border-stroke-soft-200 p-8 text-center">
          <RiParentLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
          <p className="text-paragraph-sm text-text-sub-600">
            {t("admin-panel-students-registrations:detail.noGuardians")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {guardians.map((guardian: StudentGuardian) => (
            <div
              key={guardian.id}
              className="rounded-lg border border-stroke-soft-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-label-sm text-text-strong-950">
                      {guardian.name}
                    </p>
                    {guardian.isPrimary && (
                      <Badge variant="default" className="text-[10px] px-1.5">
                        {t(
                          "admin-panel-students-registrations:detail.primaryGuardian"
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-paragraph-xs text-text-sub-600 mt-0.5 capitalize">
                    {t(
                      `admin-panel-students-registrations:guardianRelation.${guardian.relation}`
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-paragraph-xs text-text-sub-600">
                <span className="flex items-center gap-1">
                  <RiPhoneLine className="size-3" />
                  {guardian.phone}
                </span>
                {guardian.email && (
                  <span className="flex items-center gap-1">
                    <RiMailLine className="size-3" />
                    {guardian.email}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Attendance Tab ────────────────────────────────────────

function AttendanceTab() {
  const { t } = useTranslation("admin-panel-students-registrations");

  return (
    <div className="space-y-4">
      <h4 className="text-label-sm text-text-sub-600">
        {t("admin-panel-students-registrations:detail.attendance.title")}
      </h4>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: t(
              "admin-panel-students-registrations:detail.attendance.totalDays"
            ),
            value: "—",
            color: "bg-bg-weak-50",
          },
          {
            label: t(
              "admin-panel-students-registrations:detail.attendance.present"
            ),
            value: "—",
            color: "bg-success-lighter",
          },
          {
            label: t(
              "admin-panel-students-registrations:detail.attendance.absent"
            ),
            value: "—",
            color: "bg-error-lighter",
          },
          {
            label: t(
              "admin-panel-students-registrations:detail.attendance.percentage"
            ),
            value: "—",
            color: "bg-primary-lighter",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-lg ${item.color} p-3 text-center`}
          >
            <p className="text-title-sm text-text-strong-950">{item.value}</p>
            <p className="text-paragraph-xs text-text-sub-600 mt-1">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-stroke-soft-200 p-8 text-center">
        <RiBarChartLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
        <p className="text-paragraph-sm text-text-sub-600">
          {t("admin-panel-students-registrations:detail.attendance.noData")}
        </p>
      </div>
    </div>
  );
}

// ─── Fees Tab ──────────────────────────────────────────────

function FeesTab() {
  const { t } = useTranslation("admin-panel-students-registrations");

  return (
    <div className="space-y-4">
      <h4 className="text-label-sm text-text-sub-600">
        {t("admin-panel-students-registrations:detail.fees.title")}
      </h4>

      <div className="rounded-lg border border-stroke-soft-200 p-8 text-center">
        <RiMoneyDollarCircleLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
        <p className="text-paragraph-sm text-text-sub-600">
          {t("admin-panel-students-registrations:detail.fees.noData")}
        </p>
      </div>
    </div>
  );
}

// ─── Exams Tab ─────────────────────────────────────────────

function ExamsTab() {
  const { t } = useTranslation("admin-panel-students-registrations");

  return (
    <div className="space-y-4">
      <h4 className="text-label-sm text-text-sub-600">
        {t("admin-panel-students-registrations:detail.exams.title")}
      </h4>

      <div className="rounded-lg border border-stroke-soft-200 p-8 text-center">
        <RiFileListLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
        <p className="text-paragraph-sm text-text-sub-600">
          {t("admin-panel-students-registrations:detail.exams.noData")}
        </p>
      </div>
    </div>
  );
}

// ─── Activity Tab ──────────────────────────────────────────

function ActivityTab() {
  const { t } = useTranslation("admin-panel-students-registrations");

  // Demo activity entries for UI preview
  const demoActivities = [
    {
      id: 1,
      action: "registered",
      description: t(
        "admin-panel-students-registrations:detail.activityLog.actions.registered"
      ),
      timestamp: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-label-sm text-text-sub-600">
        {t("admin-panel-students-registrations:detail.activityLog.title")}
      </h4>

      <div className="space-y-3">
        {demoActivities.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 rounded-lg border border-stroke-soft-200 p-3"
          >
            <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-primary-lighter">
              <RiTimeLine className="size-4 text-primary-base" />
            </div>
            <div className="flex-1">
              <p className="text-label-sm text-text-strong-950">
                {entry.description}
              </p>
              <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Sub-components ─────────────────────────────────

function InfoRow({
  icon: Icon,
  value,
}: {
  icon: typeof RiMailLine;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-paragraph-sm text-text-strong-950">
      <Icon className="size-4 text-text-sub-600 shrink-0" />
      {value}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-paragraph-xs text-text-sub-600">{label}</p>
      <p className="text-label-sm text-text-strong-950 mt-0.5">
        {value ?? "—"}
      </p>
    </div>
  );
}
