"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider, useFormState, useWatch } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "@/hooks/use-snackbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormDatePickerInput from "@/components/form/date-pickers/date-picker";
import FormRadioInput from "@/components/form/radio-group/form-radio-group";
import FormSelectInput from "@/components/form/select/form-select";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiInformationLine,
} from "@remixicon/react";
import {
  useRegisterStudentMutation,
  useUpdateStudentMutation,
  useStudentDetailQuery,
} from "../queries/queries";
import { useInstitutionsListQuery } from "../../../academics/courses/queries/queries";
import {
  useClassesListQuery,
  useSectionsListQuery,
} from "../../../academics/classes/queries/queries";
import { useAcademicYearsListQuery } from "../../../academics/year/queries/queries";
import {
  Gender,
  BloodGroup,
  GUARDIAN_RELATIONS,
  DOCUMENT_TYPES,
} from "../types";
import type { Student, DocumentType } from "../types";
import { cn } from "@/utils/cn";

// ─── Types ──────────────────────────────────────────────
interface DocumentEntry {
  documentType: DocumentType;
  remarks: string;
}

type AddStudentFormData = {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: Date | null;
  gender: { id: string } | null;
  phone: string;
  address: string;
  city: string;
  bloodGroup: { id: string } | null;
  nationality: string;
  religion: string;
  // Step 2: Enrollment
  institutionId: { id: string };
  gradeClassId: { id: string } | null;
  sectionId: { id: string } | null;
  academicYearId: { id: string } | null;
  admissionDate: Date | null;
  // Step 3: Guardian
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelation: { id: string } | null;
  // Step 4: Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAltPhone: string;
};

const STEPS = [
  "basicInfo",
  "enrollmentDetails",
  "guardianInfo",
  "emergencyContact",
  "documents",
] as const;

// ─── Options ────────────────────────────────────────────
const genderOptions = Object.values(Gender).map((g) => ({ id: g }));
const bloodGroupOptions = Object.values(BloodGroup).map((b) => ({ id: b }));
const relationOptions = GUARDIAN_RELATIONS.map((r) => ({ id: r }));

// ─── Validation ─────────────────────────────────────────
function useValidationSchema(isEditing: boolean) {
  const { t } = useTranslation("admin-panel-students-registrations");

  const passwordSchema = isEditing
    ? yup.string().default("")
    : yup
        .string()
        .min(
          6,
          t(
            "admin-panel-students-registrations:addStudent.inputs.password.validation.minLength"
          )
        )
        .required(
          t(
            "admin-panel-students-registrations:addStudent.inputs.password.validation.required"
          )
        );

  return yup.object().shape({
    firstName: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.firstName.validation.required"
        )
      ),
    lastName: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.lastName.validation.required"
        )
      ),
    email: yup
      .string()
      .email(
        t(
          "admin-panel-students-registrations:addStudent.inputs.email.validation.invalid"
        )
      )
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.email.validation.required"
        )
      ),
    password: passwordSchema,
    dateOfBirth: yup
      .date()
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.dateOfBirth.validation.required"
        )
      )
      .nullable(),
    gender: yup
      .object()
      .shape({ id: yup.string().required() })
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.gender.validation.required"
        )
      )
      .nullable(),
    phone: yup.string().default(""),
    address: yup.string().default(""),
    city: yup.string().default(""),
    bloodGroup: yup
      .object()
      .shape({ id: yup.string().required() })
      .nullable()
      .default(null),
    nationality: yup.string().default(""),
    religion: yup.string().default(""),
    institutionId: yup
      .object()
      .shape({ id: yup.string().required() })
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.institutionId.validation.required"
        )
      ),
    admissionDate: yup.date().nullable().default(null),
    gradeClassId: yup
      .object()
      .shape({ id: yup.string().required() })
      .nullable()
      .default(null),
    sectionId: yup
      .object()
      .shape({ id: yup.string().required() })
      .nullable()
      .default(null),
    academicYearId: yup
      .object()
      .shape({ id: yup.string().required() })
      .nullable()
      .default(null),
    guardianName: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.guardianName.validation.required"
        )
      ),
    guardianPhone: yup
      .string()
      .required(
        t(
          "admin-panel-students-registrations:addStudent.inputs.guardianPhone.validation.required"
        )
      ),
    guardianEmail: yup.string().email().default(""),
    guardianRelation: yup
      .object()
      .shape({ id: yup.string().required() })
      .nullable()
      .default(null),
    emergencyContactName: yup.string().default(""),
    emergencyContactPhone: yup.string().default(""),
    emergencyContactRelation: yup.string().default(""),
    emergencyContactAltPhone: yup.string().default(""),
  });
}

// ─── Step Indicator ─────────────────────────────────────
function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: readonly string[];
}) {
  const { t } = useTranslation("admin-panel-students-registrations");
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
              index < currentStep
                ? "bg-primary-base text-static-white"
                : index === currentStep
                  ? "bg-primary-base text-static-white"
                  : "bg-bg-weak-50 text-text-soft-400"
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              "hidden text-label-xs sm:inline",
              index === currentStep
                ? "text-text-strong-950"
                : "text-text-soft-400"
            )}
          >
            {t(`admin-panel-students-registrations:addStudent.steps.${step}`)}
          </span>
          {index < steps.length - 1 && (
            <div className="mx-1 h-px w-6 bg-stroke-soft-200" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Submit Button ──────────────────────────────────────
function SubmitButton() {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { isSubmitting } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      {t("admin-panel-students-registrations:actions.submit")}
    </Button>
  );
}

// ─── Step Content Components ────────────────────────────
function StepBasicInfo() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="firstName"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.firstName.label"
          )}
          testId="student-first-name"
          autoFocus
        />
        <FormTextInput<AddStudentFormData>
          name="lastName"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.lastName.label"
          )}
          testId="student-last-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="email"
          type="email"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.email.label"
          )}
          testId="student-email"
        />
        <FormTextInput<AddStudentFormData>
          name="password"
          type="password"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.password.label"
          )}
          testId="student-password"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormDatePickerInput<AddStudentFormData>
          name="dateOfBirth"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.dateOfBirth.label"
          )}
          maxDate={new Date()}
          testId="student-dob"
        />
        <FormTextInput<AddStudentFormData>
          name="phone"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.phone.label"
          )}
          testId="student-phone"
        />
      </div>

      <FormRadioInput<AddStudentFormData, { id: string }>
        name="gender"
        label={t(
          "admin-panel-students-registrations:addStudent.inputs.gender.label"
        )}
        options={genderOptions}
        keyValue="id"
        keyExtractor={(o) => o.id}
        renderOption={(o) =>
          t(`admin-panel-students-registrations:gender.${o.id}`)
        }
        testId="student-gender"
      />

      <FormTextInput<AddStudentFormData>
        name="address"
        label={t(
          "admin-panel-students-registrations:addStudent.inputs.address.label"
        )}
        multiline
        minRows={2}
        testId="student-address"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="city"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.city.label"
          )}
          testId="student-city"
        />
        <FormSelectInput<AddStudentFormData, { id: string }>
          name="bloodGroup"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.bloodGroup.label"
          )}
          options={bloodGroupOptions}
          keyValue="id"
          renderOption={(o) =>
            t(`admin-panel-students-registrations:bloodGroup.${o.id}`)
          }
          testId="student-blood-group"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="nationality"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.nationality.label"
          )}
          testId="student-nationality"
        />
        <FormTextInput<AddStudentFormData>
          name="religion"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.religion.label"
          )}
          testId="student-religion"
        />
      </div>
    </div>
  );
}

function StepEnrollmentDetails() {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { data: institutions } = useInstitutionsListQuery();
  const { data: classes } = useClassesListQuery();
  const { data: sections } = useSectionsListQuery();
  const { data: academicYears } = useAcademicYearsListQuery();

  const selectedGradeClassId = useWatch<AddStudentFormData>({
    name: "gradeClassId",
  }) as { id: string } | null | undefined;

  const institutionOptions = (institutions ?? []).map((inst) => ({
    id: String(inst.id),
    label: inst.name,
  }));

  const classOptions = (classes ?? []).map((cls) => ({
    id: String(cls.id),
    label: cls.name,
  }));

  // Filter sections by selected grade class
  const filteredSections = (sections ?? []).filter(
    (s) =>
      !selectedGradeClassId?.id ||
      String(s.gradeClassId) === selectedGradeClassId.id
  );
  const sectionOptions = filteredSections.map((s) => ({
    id: String(s.id),
    label: s.name,
  }));

  const academicYearOptions = (academicYears ?? []).map((ay) => ({
    id: String(ay.id),
    label: ay.name,
  }));

  return (
    <div className="grid gap-4">
      <FormSelectInput<AddStudentFormData, { id: string; label: string }>
        name="institutionId"
        label={t(
          "admin-panel-students-registrations:addStudent.inputs.institutionId.label"
        )}
        options={institutionOptions}
        keyValue="id"
        renderOption={(o) => o.label}
        testId="student-institution"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelectInput<AddStudentFormData, { id: string; label: string }>
          name="gradeClassId"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.gradeClassId.label"
          )}
          options={classOptions}
          keyValue="id"
          renderOption={(o) => o.label}
          testId="student-grade-class"
        />
        <FormSelectInput<AddStudentFormData, { id: string; label: string }>
          name="sectionId"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.sectionId.label"
          )}
          options={sectionOptions}
          keyValue="id"
          renderOption={(o) => o.label}
          testId="student-section"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelectInput<AddStudentFormData, { id: string; label: string }>
          name="academicYearId"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.academicYearId.label"
          )}
          options={academicYearOptions}
          keyValue="id"
          renderOption={(o) => o.label}
          testId="student-academic-year"
        />
        <FormDatePickerInput<AddStudentFormData>
          name="admissionDate"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.admissionDate.label"
          )}
          testId="student-admission-date"
        />
      </div>
    </div>
  );
}

function StepGuardianInfo() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="guardianName"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.guardianName.label"
          )}
          testId="student-guardian-name"
        />
        <FormTextInput<AddStudentFormData>
          name="guardianPhone"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.guardianPhone.label"
          )}
          testId="student-guardian-phone"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="guardianEmail"
          type="email"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.guardianEmail.label"
          )}
          testId="student-guardian-email"
        />
        <FormSelectInput<AddStudentFormData, { id: string }>
          name="guardianRelation"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.guardianRelation.label"
          )}
          options={relationOptions}
          keyValue="id"
          renderOption={(o) =>
            t(`admin-panel-students-registrations:guardianRelation.${o.id}`)
          }
          testId="student-guardian-relation"
        />
      </div>
    </div>
  );
}

function StepEmergencyContact() {
  const { t } = useTranslation("admin-panel-students-registrations");
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
        <div className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
          <RiInformationLine className="size-4 shrink-0" />
          Provide emergency contact details different from the primary guardian
          if applicable.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="emergencyContactName"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.emergencyContactName.label"
          )}
          testId="student-emergency-name"
        />
        <FormTextInput<AddStudentFormData>
          name="emergencyContactRelation"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.emergencyContactRelation.label"
          )}
          testId="student-emergency-relation"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormTextInput<AddStudentFormData>
          name="emergencyContactPhone"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.emergencyContactPhone.label"
          )}
          testId="student-emergency-phone"
        />
        <FormTextInput<AddStudentFormData>
          name="emergencyContactAltPhone"
          label={t(
            "admin-panel-students-registrations:addStudent.inputs.emergencyContactAltPhone.label"
          )}
          testId="student-emergency-alt-phone"
        />
      </div>
    </div>
  );
}

function StepDocuments({
  documents,
  onAdd,
  onRemove,
}: {
  documents: DocumentEntry[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation("admin-panel-students-registrations");
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
        <div className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
          <RiInformationLine className="size-4 shrink-0" />
          {t(
            "admin-panel-students-registrations:addStudent.documentsStep.skipNote"
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stroke-soft-200 p-8 text-center">
          <RiFileTextLine className="mx-auto size-8 text-text-disabled-300 mb-2" />
          <p className="text-paragraph-sm text-text-sub-600">
            {t(
              "admin-panel-students-registrations:addStudent.documentsStep.noDocuments"
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-error-base hover:text-error-base"
              >
                <RiDeleteBinLine className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={onAdd} className="w-fit">
        <RiAddLine className="size-4 mr-1" />
        {t(
          "admin-panel-students-registrations:addStudent.documentsStep.addDocument"
        )}
      </Button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Student | null;
}

export default function AddStudentModal({
  open,
  onOpenChange,
  editData,
}: AddStudentModalProps) {
  const { t } = useTranslation("admin-panel-students-registrations");
  const { enqueueSnackbar } = useSnackbar();
  const registerMutation = useRegisterStudentMutation();
  const updateMutation = useUpdateStudentMutation();
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentEntry[]>([]);

  const isEditing = !!editData;

  // Fetch full student detail (includes enrollments) when editing
  const { data: studentDetail } = useStudentDetailQuery(editData?.id ?? 0);

  // Fetch sections list to derive gradeClassId from sectionId
  const { data: allSections } = useSectionsListQuery();

  const validationSchema = useValidationSchema(isEditing);

  const methods = useForm<AddStudentFormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      firstName: editData?.firstName ?? "",
      lastName: editData?.lastName ?? "",
      email: editData?.email ?? "",
      password: "",
      dateOfBirth: editData?.dateOfBirth
        ? new Date(editData.dateOfBirth)
        : null,
      gender: editData?.gender ? { id: editData.gender } : null,
      phone: editData?.phone ?? "",
      address: editData?.address ?? "",
      city: editData?.city ?? "",
      bloodGroup: editData?.bloodGroup ? { id: editData.bloodGroup } : null,
      nationality: editData?.nationality ?? "",
      religion: editData?.religion ?? "",
      institutionId: { id: String(editData?.institutionId ?? "1") },
      gradeClassId: null,
      sectionId: null,
      academicYearId: null,
      admissionDate: editData?.admissionDate
        ? new Date(editData.admissionDate)
        : null,
      guardianName: editData?.guardianName ?? "",
      guardianPhone: editData?.guardianPhone ?? "",
      guardianEmail: editData?.guardianEmail ?? "",
      guardianRelation: editData?.guardianRelation
        ? { id: editData.guardianRelation }
        : null,
      emergencyContactName: editData?.emergencyContactName ?? "",
      emergencyContactPhone: editData?.emergencyContactPhone ?? "",
      emergencyContactRelation: editData?.emergencyContactRelation ?? "",
      emergencyContactAltPhone: "",
    },
  });

  const { handleSubmit, reset, trigger } = methods;

  // Reset form values when editData changes (e.g. switching from create to edit)
  useEffect(() => {
    if (open) {
      // Derive enrollment data when editing
      const detail = isEditing ? studentDetail : undefined;
      const activeEnrollment =
        detail?.enrollments?.find((e) => e.status === "active") ??
        detail?.enrollments?.[0];

      // Derive gradeClassId from sectionId using sections list
      let derivedGradeClassId: string | null = null;
      if (activeEnrollment?.sectionId && allSections) {
        const section = allSections.find(
          (s) => s.id === activeEnrollment.sectionId
        );
        if (section) {
          derivedGradeClassId = String(section.gradeClassId);
        }
      }

      reset({
        firstName: editData?.firstName ?? "",
        lastName: editData?.lastName ?? "",
        email: editData?.email ?? "",
        password: "",
        dateOfBirth: editData?.dateOfBirth
          ? new Date(editData.dateOfBirth)
          : null,
        gender: editData?.gender ? { id: editData.gender } : null,
        phone: editData?.phone ?? "",
        address: editData?.address ?? "",
        city: editData?.city ?? "",
        bloodGroup: editData?.bloodGroup ? { id: editData.bloodGroup } : null,
        nationality: editData?.nationality ?? "",
        religion: editData?.religion ?? "",
        institutionId: { id: String(editData?.institutionId ?? "1") },
        gradeClassId: derivedGradeClassId ? { id: derivedGradeClassId } : null,
        sectionId: activeEnrollment?.sectionId
          ? { id: String(activeEnrollment.sectionId) }
          : null,
        academicYearId: activeEnrollment?.academicYearId
          ? { id: String(activeEnrollment.academicYearId) }
          : null,
        admissionDate: editData?.admissionDate
          ? new Date(editData.admissionDate)
          : null,
        guardianName: editData?.guardianName ?? "",
        guardianPhone: editData?.guardianPhone ?? "",
        guardianEmail: editData?.guardianEmail ?? "",
        guardianRelation: editData?.guardianRelation
          ? { id: editData.guardianRelation }
          : null,
        emergencyContactName: editData?.emergencyContactName ?? "",
        emergencyContactPhone: editData?.emergencyContactPhone ?? "",
        emergencyContactRelation: editData?.emergencyContactRelation ?? "",
        emergencyContactAltPhone: "",
      });
      setCurrentStep(0);
    }
  }, [editData, open, reset, isEditing, studentDetail, allSections]);

  const handleNext = useCallback(async () => {
    const stepFields: Record<number, (keyof AddStudentFormData)[]> = {
      0: [
        "firstName",
        "lastName",
        "email",
        "password",
        "dateOfBirth",
        "gender",
      ],
      1: ["institutionId"],
      2: ["guardianName", "guardianPhone"],
      3: [],
    };
    const fields = stepFields[currentStep];
    if (fields && fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [currentStep, trigger]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleAddDocument = useCallback(() => {
    setPendingDocuments((prev) => [
      ...prev,
      { documentType: DOCUMENT_TYPES[0], remarks: "" },
    ]);
  }, []);

  const handleRemoveDocument = useCallback((index: number) => {
    setPendingDocuments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const buildPayload = useCallback(
    (formData: AddStudentFormData) => ({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      institutionId: parseInt(formData.institutionId.id, 10) || 1,
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.toISOString().split("T")[0]
        : "",
      gender: formData.gender?.id || "male",
      guardianName: formData.guardianName,
      guardianPhone: formData.guardianPhone,
      guardianEmail: formData.guardianEmail || undefined,
      guardianRelation: formData.guardianRelation?.id || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      bloodGroup: formData.bloodGroup?.id || undefined,
      nationality: formData.nationality || undefined,
      religion: formData.religion || undefined,
      admissionDate: formData.admissionDate
        ? formData.admissionDate.toISOString().split("T")[0]
        : undefined,
      emergencyContactName: formData.emergencyContactName || undefined,
      emergencyContactPhone: formData.emergencyContactPhone || undefined,
      emergencyContactRelation: formData.emergencyContactRelation || undefined,
      sectionId: formData.sectionId
        ? parseInt(formData.sectionId.id, 10)
        : undefined,
      academicYearId: formData.academicYearId
        ? parseInt(formData.academicYearId.id, 10)
        : undefined,
    }),
    []
  );

  const buildUpdatePayload = useCallback(
    (formData: AddStudentFormData) => ({
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      phone: formData.phone || undefined,
      gender: formData.gender?.id || undefined,
      guardianName: formData.guardianName || undefined,
      guardianPhone: formData.guardianPhone || undefined,
      guardianEmail: formData.guardianEmail || undefined,
      guardianRelation: formData.guardianRelation?.id || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      bloodGroup: formData.bloodGroup?.id || undefined,
      nationality: formData.nationality || undefined,
      religion: formData.religion || undefined,
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.toISOString().split("T")[0]
        : undefined,
      admissionDate: formData.admissionDate
        ? formData.admissionDate.toISOString().split("T")[0]
        : undefined,
      institutionId: parseInt(formData.institutionId.id, 10) || undefined,
      sectionId: formData.sectionId
        ? parseInt(formData.sectionId.id, 10)
        : undefined,
      academicYearId: formData.academicYearId
        ? parseInt(formData.academicYearId.id, 10)
        : undefined,
      emergencyContactName: formData.emergencyContactName || undefined,
      emergencyContactPhone: formData.emergencyContactPhone || undefined,
      emergencyContactRelation: formData.emergencyContactRelation || undefined,
    }),
    []
  );

  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (isEditing && editData) {
        await updateMutation.mutateAsync({
          id: editData.id,
          data: buildUpdatePayload(formData) as any,
        });
      } else {
        await registerMutation.mutateAsync(buildPayload(formData) as any);
      }

      enqueueSnackbar(
        t(
          isEditing
            ? "admin-panel-students-registrations:addStudent.updateSuccess"
            : "admin-panel-students-registrations:addStudent.success"
        ),
        { variant: "success" }
      );
      onOpenChange(false);
      reset();
      setCurrentStep(0);
      setPendingDocuments([]);
    } catch {
      enqueueSnackbar(
        isEditing ? "Failed to update student" : "Failed to register student",
        { variant: "error" }
      );
    }
  });

  const handleSaveDraft = useCallback(async () => {
    if (isEditing) return; // Draft only for new registrations
    const formData = methods.getValues();
    try {
      await registerMutation.mutateAsync({
        ...buildPayload(formData),
        isDraft: true,
      } as any);
      enqueueSnackbar(
        t("admin-panel-students-registrations:addStudent.draftSuccess"),
        { variant: "success" }
      );
      onOpenChange(false);
      reset();
      setCurrentStep(0);
      setPendingDocuments([]);
    } catch {
      enqueueSnackbar("Failed to save draft", { variant: "error" });
    }
  }, [
    isEditing,
    methods,
    buildPayload,
    registerMutation,
    enqueueSnackbar,
    t,
    onOpenChange,
    reset,
  ]);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setCurrentStep(0);
        setPendingDocuments([]);
        reset();
      }
    },
    [onOpenChange, reset]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editData
              ? t("admin-panel-students-registrations:addStudent.editTitle")
              : t("admin-panel-students-registrations:addStudent.title")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin-panel-students-registrations:addStudent.title")}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="border-b border-stroke-soft-200 pb-4">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="mt-4">
            {/* Step Content */}
            <div className="max-h-[60vh] overflow-y-auto px-1">
              {currentStep === 0 && <StepBasicInfo />}
              {currentStep === 1 && <StepEnrollmentDetails />}
              {currentStep === 2 && <StepGuardianInfo />}
              {currentStep === 3 && <StepEmergencyContact />}
              {currentStep === 4 && (
                <StepDocuments
                  documents={pendingDocuments}
                  onAdd={handleAddDocument}
                  onRemove={handleRemoveDocument}
                />
              )}
            </div>

            {/* Navigation */}
            <DialogFooter className="mt-6 gap-2">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  {t("admin-panel-students-registrations:actions.previous")}
                </Button>
              )}
              <div className="flex-1" />
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleSaveDraft()}
                >
                  {t("admin-panel-students-registrations:actions.saveDraft")}
                </Button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  {t("admin-panel-students-registrations:actions.next")}
                </Button>
              ) : (
                <SubmitButton />
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
