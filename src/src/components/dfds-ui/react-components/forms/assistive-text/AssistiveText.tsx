import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@/components/dfds-ui/theme'

const AssistiveText = styled.div<{ inverted?: boolean }>`
  font-size: 12px;
  line-height: 15px;
  ${(p) =>
    p.inverted &&
    css`
      color: ${theme.colors.text.light.primary};
    `};
`
export default AssistiveText
