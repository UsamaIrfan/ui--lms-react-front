"use client";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import React, { ChangeEvent, Ref, useState } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type TextInputProps = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  autoComplete?: string;
  inputComponent?: React.ElementType;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  size?: "small" | "medium";
};

function TextInput(
  props: TextInputProps & {
    name: string;
    value: string;
    onChange: (
      value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const handleClickShowPassword = () => setIsShowPassword((show) => !show);

  const inputType =
    props.type === "password" && isShowPassword ? "text" : props.type;

  return (
    <div ref={props.ref} className="space-y-2">
      <Label
        htmlFor={props.name}
        className={cn(props.error && "text-error-base")}
      >
        {props.label}
      </Label>
      {props.multiline ? (
        <Textarea
          id={props.name}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          onBlur={props.onBlur}
          autoFocus={props.autoFocus}
          disabled={props.disabled}
          readOnly={props.readOnly}
          rows={props.minRows ?? 3}
          data-testid={props.testId}
          className={cn(props.error && "border-destructive")}
          autoComplete={props.autoComplete}
        />
      ) : (
        <div className="relative">
          <Input
            id={props.name}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            type={inputType}
            disabled={props.disabled}
            readOnly={props.readOnly}
            data-testid={props.testId}
            autoComplete={props.autoComplete}
            className={cn(
              props.error && "border-destructive",
              props.type === "password" && "pr-10"
            )}
          />
          {props.type === "password" && (
            <button
              type="button"
              onClick={handleClickShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft-400 hover:text-text-strong-950"
              aria-label="toggle password visibility"
              tabIndex={-1}
            >
              {isShowPassword ? (
                <RiEyeOffLine className="h-4 w-4" />
              ) : (
                <RiEyeLine className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      )}
      {props.error && (
        <p
          className="text-sm text-error-base"
          data-testid={`${props.testId}-error`}
        >
          {props.error}
        </p>
      )}
    </div>
  );
}

function FormTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> &
    TextInputProps
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <TextInput
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          multiline={props.multiline}
          minRows={props.minRows}
          maxRows={props.maxRows}
          inputComponent={props.inputComponent}
          size={props.size}
        />
      )}
    />
  );
}

export default FormTextInput;
