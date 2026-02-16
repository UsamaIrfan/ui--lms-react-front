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
export type TimePickerFieldProps = {
  disabled?: boolean;
  className?: string;
  views?: readonly string[] | undefined;
  autoFocus?: boolean;
  readOnly?: boolean;
  label: string;
  testId?: string;
  error?: string;
  defaultValue?: ValueDateType;
  format?: string;
  minTime?: Date | undefined;
  maxTime?: Date | undefined;
  timeSteps?:
    | { hours?: number; minutes?: number; seconds?: number }
    | undefined;
};

function TimePickerInput(
  props: TimePickerFieldProps & {
    name: string;
    value: ValueDateType;
    onChange: (value: ValueDateType) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const stringValue = props.value ? format(props.value, "HH:mm") : "";

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
        type="time"
        value={stringValue}
        onChange={(e) => {
          if (!e.target.value) {
            props.onChange(null);
            return;
          }
          const [hours, minutes] = e.target.value.split(":").map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          props.onChange(date);
        }}
        onBlur={props.onBlur}
        disabled={props.disabled}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus}
        min={props.minTime ? format(props.minTime, "HH:mm") : undefined}
        max={props.maxTime ? format(props.maxTime, "HH:mm") : undefined}
        step={
          props.timeSteps?.minutes ? props.timeSteps.minutes * 60 : undefined
        }
        data-testid={props.testId}
        className={cn(props.error && "border-destructive")}
      />
      {props.error && <p className="text-sm text-error-base">{props.error}</p>}
    </div>
  );
}

function FormTimePickerInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: TimePickerFieldProps &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => {
        return (
          <TimePickerInput
            {...field}
            defaultValue={props.defaultValue}
            autoFocus={props.autoFocus}
            label={props.label}
            disabled={props.disabled}
            readOnly={props.readOnly}
            views={props.views}
            testId={props.testId}
            format={props.format}
            error={fieldState.error?.message}
            minTime={props.minTime}
            maxTime={props.maxTime}
            timeSteps={props.timeSteps}
          />
        );
      }}
    />
  );
}

export default FormTimePickerInput;
