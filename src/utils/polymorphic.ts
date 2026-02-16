// AlignUI polymorphic utility types
import * as React from "react";

/**
 * Utility type to extract the ref type from a React element type.
 * @template C - The React element type.
 */
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];

/**
 * Utility type to create polymorphic component props.
 * Merges custom props with the intrinsic props of the specified element type,
 * excluding any overlapping keys from the custom props.
 *
 * @template C - The React element type.
 * @template Props - Additional custom props.
 */
export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = object,
> = Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props> & {
    as?: C;
  };

/**
 * Utility type to create polymorphic component props with ref.
 *
 * @template C - The React element type.
 * @template Props - Additional custom props.
 */
export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = object,
> = PolymorphicComponentProps<C, Props> & {
  ref?: PolymorphicRef<C>;
};

/**
 * Utility type to define a polymorphic component.
 *
 * @template C - The default React element type.
 * @template Props - Additional custom props.
 */
export type PolymorphicComponent<
  C extends React.ElementType = "div",
  Props = object,
> = <OverrideC extends React.ElementType = C>(
  props: PolymorphicComponentPropsWithRef<OverrideC, Props>
) => React.ReactNode;
