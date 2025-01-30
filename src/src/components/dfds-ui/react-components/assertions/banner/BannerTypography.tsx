import React from 'react'
import { Text } from '@dfds-ui/typography'
import { css } from '@emotion/react'

export const BannerHeadline: React.FunctionComponent<{ className?: string }> = (props) => {
  return (
    <Text
      as="h2"
      styledAs="bodyInterfaceBold"
      css={css`
        margin: 0;
      `}
      {...props}
    />
  )
}

export const BannerParagraph: React.FunctionComponent<{ className?: string }> = (props) => {
  return (
    <Text
      as="p"
      styledAs="bodyInterface"
      css={css`
        margin: 0;
      `}
      {...props}
    />
  )
}
