/* eslint-disable deprecation/deprecation */
import React from 'react'
import { ReactSelectWrapper, Icon, ClearIndicator } from '../reactselect/ReactSelect'
import { Down } from '@/dfds-ui/icons/src'
import AsyncSelect from 'react-select/async'
import ErrorText from '../error-text/ErrorText'
import AssistiveText from '../assistive-text/AssistiveText'
import { theme } from '@/dfds-ui/theme/src'

export type SearchableSelectProps = Omit<React.PropsWithRef<AsyncSelect>, 'size' | 'css'>

export type Size = 'small' | 'medium'

const AsyncSearchableSelect: React.ForwardRefRenderFunction<any, any> = ({
  name,
  error,
  selectClassName,
  className,
  icon,
  disabled,
  size = 'medium',
  arrow = true,
  htmlSize,
  handleInputChange,
  loadOptions,
  onBlur,
  onFocus,
  onChange,
  assistiveText,
  autoFocus,
  ...rest
}) => {
  const DropdownIndicator = (props: any) => {
    const {
      children = (
        <Icon size={size} disabled={disabled}>
          {icon || <Down />}
        </Icon>
      ),
      getStyles,
      innerProps: { ref, ...restInnerProps },
    } = props

    return (
      <div {...restInnerProps} ref={ref} style={getStyles('dropdownIndicator', props)}>
        <div style={{ padding: `0 ${theme.spacing.xxs}` }}>{children}</div>
      </div>
    )
  }

  return (
    <ReactSelectWrapper error={error} size={size} className={className} arrow={arrow}>
      <AsyncSelect
        as="Select"
        name={name}
        aria-invalid={error}
        visualSize={size}
        size={htmlSize}
        isDisabled={disabled}
        classNamePrefix="react-select"
        className={selectClassName}
        loadOptions={loadOptions}
        onInputChange={handleInputChange}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        autoFocus={autoFocus}
        components={{ DropdownIndicator, ClearIndicator }}
        {...rest}
      />

      {error ? <ErrorText small>{error}</ErrorText> : assistiveText && <AssistiveText>{assistiveText}</AssistiveText>}
    </ReactSelectWrapper>
  )
}

export default AsyncSearchableSelect
