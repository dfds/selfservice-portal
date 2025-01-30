import React, { ReactNode, useMemo, useState } from 'react'
import { FlexBox } from '@/components/dfds-ui/react-components/flexbox'
import { css } from '@emotion/react'
import { Radio, RadioStyleState } from '../radio'
import { Text } from '@/components/dfds-ui/typography'
import { FieldWrap, FieldWrapProps } from '../field-wrap/FieldWrap'
import { theme } from '@/components/dfds-ui/theme'
import { Size } from '../types'

const scaleSpacingCss = css`
  width: 1.5rem;
  margin-right: 1rem;
  margin-left: 0;
  margin-top: 0;
`

const scaleLabelsSpacingCss = css`
  margin-bottom: 0.5rem;
  padding-top: 0.5rem;
`

const RatingHint = ({ children, side }: { children: ReactNode; side: 'leading' | 'trailing' }) => {
  return (
    <Text
      as="span"
      styledAs="bodyInterface"
      css={css`
        padding-bottom: 0.5rem;
        color: ${theme.colors.text.dark.secondary};
        ${side === 'leading' ? `margin-right: 1rem;` : 'margin-left: 1rem;'}
      `}
    >
      {children}
    </Text>
  )
}

export type RatingProps = {
  /**
   * Amount of related checkboxes
   */
  rangeCardinality: number
  /**
   * Name for the checkbox group
   */
  name: string
  /**
   * Hint text on the left
   */
  leadingHint?: string
  /**
   * Hint text on the right
   */
  trailingHint?: string
  /**
   * Labels on top of the radio selectors, a string returning function called with the selector's index
   */
  scaleLabels?: (index: number) => string
  /**
   * If used as a controlled component, this value sets the selected radio
   */
  value?: number
  /**
   * Initial selected value
   */
  defaultValue?: number
  /**
   * Callback when the user changes the selected value
   */
  onChange?: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  showScaleLabels?: boolean
  /**
   * When this property is `true`, it styles the radios to the left of the selected as `checked`
   */
  cumulative?: boolean
  Icon?: (index: number) => React.ComponentType
}

type RatingRowProps = Omit<RatingProps, 'showScaleLabels' | 'leftHint' | 'rightHint'>

const RatingRow = React.forwardRef<HTMLInputElement, RatingRowProps>(
  ({ rangeCardinality, disabled, name, onChange, value, cumulative, defaultValue, Icon }, ref) => {
    // When `cumulative` is set, but not as a controlled component,
    // we need to keep track of the current selected value from the rendered
    // radios so that we can override the styles appropiately.
    const [valueCC, setValueCC] = useState(value !== undefined ? value : defaultValue)
    const styledAs = useMemo<(k: number) => undefined | RadioStyleState>(() => {
      if (!cumulative) return () => undefined
      if (!valueCC) return () => undefined
      if (value !== undefined) return (k) => (k < value ? 'checked' : undefined)
      return (k) => (k < valueCC ? 'checked' : undefined)
    }, [cumulative, value, valueCC])

    const valueProps = (k: number) =>
      value !== undefined
        ? {
            checked: value === k,
          }
        : {}
    return (
      <FlexBox>
        {[...new Array(rangeCardinality)].map((_v, k) => (
          <Radio
            ref={ref}
            Icon={Icon && Icon(k)}
            disabled={disabled}
            name={name}
            key={k}
            {...(defaultValue === k
              ? {
                  defaultChecked: true,
                }
              : {})}
            css={css`
              ${scaleSpacingCss}
              margin-bottom: 0.5rem;
              ${k === rangeCardinality - 1 ? `margin-right: 0;` : ''}
            `}
            onChange={(event) => {
              if (event.target.checked) {
                setValueCC(k)
              }
              onChange && onChange(k, event)
            }}
            styledAs={styledAs(k)}
            value={k.toString()}
            {...valueProps(k)}
          />
        ))}
      </FlexBox>
    )
  }
)

export const Rating = React.forwardRef<HTMLInputElement, RatingProps>(
  (
    {
      rangeCardinality,
      name,
      leadingHint,
      trailingHint,
      scaleLabels,
      onChange,
      value,
      disabled,
      showScaleLabels = true,
      cumulative,
      defaultValue,
      Icon,
    },
    ref
  ) => {
    const defaultLabels = [...new Array(rangeCardinality)].map((_v, k) => (k + 1).toString())
    const labels = (scaleLabels && defaultLabels.map((_v, k) => scaleLabels(k))) || defaultLabels

    const ratingProps = {
      rangeCardinality,
      name,
      disabled,
      onChange,
      value,
      cumulative,
      defaultValue,
      Icon,
      ref,
    }
    return (
      <FlexBox
        {...(!showScaleLabels
          ? {
              css: css`
                margin-top: 0.5rem;
              `,
            }
          : {})}
        itemsFlexEnd
      >
        {leadingHint && <RatingHint side="leading">{leadingHint}</RatingHint>}
        {showScaleLabels ? (
          <span>
            <FlexBox>
              {labels.map((l, k) => (
                <Text
                  key={l}
                  as="span"
                  styledAs="bodyInterface"
                  css={css`
                    ${scaleSpacingCss}
                    ${k === labels.length - 1 && `margin-right: 0;`}
                  ${scaleLabelsSpacingCss}
                  text-align: center;
                    color: ${theme.colors.text.dark.secondary};
                  `}
                >
                  {l}
                </Text>
              ))}
            </FlexBox>
            <RatingRow {...ratingProps} />
          </span>
        ) : (
          <RatingRow {...ratingProps} />
        )}
        {trailingHint && <RatingHint side="trailing">{trailingHint}</RatingHint>}
      </FlexBox>
    )
  }
)

export type RatingFieldProps = RatingProps &
  Omit<FieldWrapProps, 'size' | 'placeholder' | 'helpPlacement' | 'children'> & {
    size: Exclude<Size, 'large'>
  }

/**
 * The `RatingField` component will allow the user to provide feedback by ranking things on a specified scale.
 */
export const RatingField = React.forwardRef<HTMLInputElement, RatingFieldProps>(
  (
    {
      name,
      label,
      size,
      errorMessage,
      assistiveText,
      hideAsterisk,
      required,
      rangeCardinality,
      scaleLabels,
      leadingHint,
      trailingHint,
      extraAssistiveText,
      cumulative,
      value,
      help,
      disabled,
      onChange,
      showScaleLabels,
      defaultValue,
      Icon,
      className,
    },
    ref
  ) => {
    return (
      <FieldWrap
        name={name}
        label={label}
        size={size}
        errorMessage={errorMessage}
        assistiveText={assistiveText}
        extraAssistiveText={extraAssistiveText}
        required={required}
        help={help}
        hideAsterisk={hideAsterisk}
        disabled={disabled}
        className={className}
      >
        <Rating
          rangeCardinality={rangeCardinality}
          scaleLabels={scaleLabels}
          name={name}
          leadingHint={leadingHint}
          trailingHint={trailingHint}
          value={value}
          onChange={onChange}
          disabled={disabled}
          showScaleLabels={showScaleLabels}
          cumulative={cumulative}
          defaultValue={defaultValue}
          Icon={Icon}
          ref={ref}
        />
      </FieldWrap>
    )
  }
)

export default RatingField
