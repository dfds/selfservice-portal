import React, { ComponentType, ElementType } from 'react'

// TODO: Move this to future core package

// TODO: Consider changing to this pattern:
// https://blog.andrewbran.ch/polymorphic-react-components/
export type RenderContainerProps<T> = {
  renderContainer: (props: T) => JSX.Element
}

// https://github.com/kripod/react-polymorphic-box
export type PolymorphicComponentProps = {
  /**
   * HTML tag or custom component being rendered.
   */
  as?: ElementType
}

/**
 * Given a PolymorphicComponent and a desired RenderComponent this function will returns are new component where the
 * polymorphic prop will point to the provided `RenderComponent`.
 *
 * @example
 * import { Link } from `gatsby`;
 * import { AppBarItem, withRenderAs } from `@/components/dfds-ui/react-components`;
 *
 * const AppBarLink = withRenderAs(AppBarItem, Link);
 *
 * const Example = () => {
 *   return <AppBarLink id="1" title="example" to="/example">Example</AppBarLink>;
 * }
 */
export function withRenderAs<PCProps extends PolymorphicComponentProps, RCProps>(
  PolymorphicComponent: ComponentType<PCProps>,
  RenderComponent: ComponentType<RCProps>
) {
  const Component = ({ ...props }: Omit<PCProps, keyof PolymorphicComponentProps> & RCProps) => {
    return <PolymorphicComponent as={RenderComponent} {...(props as PCProps & RCProps)} />
  }
  return Component
}
