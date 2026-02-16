import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Ref } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ValueDateType = Date | null | undefined;
export type DateTimePickerFieldProps = {
  disabled?: boolean;
  className?: string;
  views?: readonly string[];
  minDate?: Date;
  maxDate?: Date;
  autoFocus?: boolean;
  readOnly?: boolean;
  label: string;
  testId?: string;
  error?: string;
  defaultValue?: ValueDateType;
};

function DateTimePickerInput(
  props: DateTimePickerFieldProps & {
    name: string;
    value: ValueDateType;
    onChange: (value: ValueDateType) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const stringValue = props.value
    ? format(props.value, "yyyy-MM-dd'T'HH:mm")
    : "";

  return (
    <div ref={props.ref} className="space-y-2">
      <Label
        htmlFor={props.name}
        className={cn(props.error && "text-error-base")}
      >
        {props.label}
      </Label>
      <Input
        id={props.name}
        name={props.name}
        type="datetime-local"
        value={stringValue}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          props.onChange(date);
        }}
        onBlur={props.onBlur}
        disabled={props.disabled}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus}
        min={
          props.minDate
            ? format(props.minDate, "yyyy-MM-dd'T'HH:mm")
            : undefined
        }
        max={
          props.maxDate
            ? format(props.maxDate, "yyyy-MM-dd'T'HH:mm")
            : undefined
        }
        data-testid={props.testId}
        className={cn(props.error && "border-destructive")}
      />
      {props.error && <p className="text-sm text-error-base">{props.error}</p>}
    </div>
  );
}

function FormDateTimePickerInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: DateTimePickerFieldProps &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => {
        return (
          <DateTimePickerInput
            {...field}
            defaultValue={props.defaultValue}
            autoFocus={props.autoFocus}
            label={props.label}
            disabled={props.disabled}
            readOnly={props.readOnly}
            views={props.views}
            testId={props.testId}
            minDate={props.minDate}
            maxDate={props.maxDate}
            error={fieldState.error?.message}
          />
        );
      }}
    />
  );
}

export default FormDateTimePickerInput;
