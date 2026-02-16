"use client";
import { uploadFile } from "@/services/api/upload-file";
import { FileEntity } from "@/services/api/types/file-entity";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MultipleImagePickerProps = {
  error?: string;
  onChange: (value: FileEntity[] | null) => void;
  onBlur: () => void;
  value?: FileEntity[];
  disabled?: boolean;
  testId?: string;
  label?: React.ReactNode;
};

function MultipleImagePicker(props: MultipleImagePickerProps) {
  const { onChange, value } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      try {
        const file = await uploadFile(acceptedFiles[0]);
        onChange([...(value ?? []), file]);
      } finally {
        setIsLoading(false);
      }
    },
    [onChange, value]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/jpg": [],
      "image/webp": [],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2, // 2MB
    disabled: isLoading || props.disabled,
  });

  const removeImageHandle =
    (id: FileEntity["id"]) =>
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      onChange(value?.filter((item) => item.id !== id) ?? []);
    };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center rounded-md border border-dashed border-stroke-soft-200 p-4 mt-4 hover:border-stroke-strong-950 transition-colors",
        props.disabled && "pointer-events-none opacity-50"
      )}
    >
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/50">
          <p className="text-lg font-bold text-white">
            {t("common:formInputs.multipleImageInput.dropzoneText")}
          </p>
        </div>
      )}
      {props?.value?.length ? (
        <div className="grid w-full grid-cols-3 gap-2">
          {props.value.map((item) => (
            <div
              key={item.id}
              className="group relative h-62.5 overflow-hidden"
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={removeImageHandle(item.id)}
                  className="text-white"
                >
                  <RiCloseLine className="h-12.5 w-12.5" />
                </button>
              </div>
              <img
                src={item.path}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <Button
          type="button"
          disabled={isLoading}
          data-testid={props.testId}
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading
            ? t("common:loading")
            : t("common:formInputs.multipleImageInput.selectFile")}
          <input {...getInputProps()} />
        </Button>
      </div>

      <p className="mt-2 text-sm text-text-soft-400">
        {t("common:formInputs.multipleImageInput.dragAndDrop")}
      </p>

      {props.error && (
        <p className="mt-2 text-sm text-error-base">{props.error}</p>
      )}
    </div>
  );
}

function FormMultipleImagePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
    label?: React.ReactNode;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <MultipleImagePicker
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          label={props.label}
          testId={props.testId}
        />
      )}
    />
  );
}

export default FormMultipleImagePicker;
