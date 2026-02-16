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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AvatarInputProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: FileEntity;
  disabled?: boolean;
  testId?: string;
};

function AvatarInput(props: AvatarInputProps) {
  const { onChange } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      try {
        const file = await uploadFile(acceptedFiles[0]);
        onChange(file);
      } finally {
        setIsLoading(false);
      }
    },
    [onChange]
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

  const removeAvatarHandle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onChange(null);
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
            {t("common:formInputs.avatarInput.dropzoneText")}
          </p>
        </div>
      )}
      {props?.value ? (
        <div className="group relative h-25 w-25">
          <Avatar className="h-25 w-25">
            <AvatarImage src={props.value?.path} />
            <AvatarFallback />
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <button
              type="button"
              onClick={removeAvatarHandle}
              className="text-white"
            >
              <RiCloseLine className="h-12.5 w-12.5" />
            </button>
          </div>
        </div>
      ) : (
        <Avatar className="h-25 w-25">
          <AvatarFallback />
        </Avatar>
      )}

      <div className="mt-4">
        <Button
          type="button"
          disabled={isLoading}
          data-testid={props.testId}
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading
            ? t("common:loading")
            : t("common:formInputs.avatarInput.selectFile")}
          <input {...getInputProps()} />
        </Button>
      </div>

      <p className="mt-2 text-sm text-text-soft-400">
        {t("common:formInputs.avatarInput.dragAndDrop")}
      </p>

      {props.error && (
        <p className="mt-2 text-sm text-error-base">{props.error}</p>
      )}
    </div>
  );
}

function FormAvatarInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <AvatarInput
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
        />
      )}
    />
  );
}

export default FormAvatarInput;
