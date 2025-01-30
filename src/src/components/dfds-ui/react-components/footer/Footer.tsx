import React from 'react'
import styled from '@emotion/styled'
import { Logo } from '../logo'

const StyledLogo = styled(Logo)``
const FooterTopSection = styled.div``
const FooterBottomSection = styled.div`
  display: flex;
  padding: 0 20px;

  ${StyledLogo} {
    height: 32px;
    margin: 20px 0;
  }
`

const Footer: React.FC<{ className?: string; bottomChildren?: React.ReactNode; children?: React.ReactNode }> = ({
  className,
  children,
  bottomChildren,
}) => {
  return (
    <div className={className}>
      {children && <FooterTopSection>{children}</FooterTopSection>}
      <FooterBottomSection>
        <StyledLogo />
        {bottomChildren}
      </FooterBottomSection>
    </div>
  )
}

export default Footer
