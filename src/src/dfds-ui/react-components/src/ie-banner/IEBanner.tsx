import React, { useState, useEffect } from 'react'
import { Banner, BannerAction, BannerHeadline, BannerParagraph } from './../assertions/banner'

type IEBannerProps = {
  heading?: string
  openInEdge: string
  /**
   * Class name to be assigned to the component
   */
  className?: string
}

const IEBanner: React.FunctionComponent<IEBannerProps> = ({ heading, openInEdge, className, children }) => {
  const [getIE, setIE] = useState(false)
  const [getIsWin10, setIsWin10] = useState(false)
  const [getLink, setLink] = useState('')

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIE(navigator.userAgent.includes('MSIE ') || navigator.userAgent.includes('Trident/'))
      setIsWin10(navigator.userAgent.includes('Windows NT 10.0'))
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (getIsWin10) {
        setLink('microsoft-edge:' + window.location.href)
      }
    }
  }, [getIsWin10])

  const navigate = () => {
    if (typeof window !== 'undefined') {
      document.location.href = getLink
    }
  }

  return getIE ? (
    <Banner
      intent={'warning'}
      className={className}
      actions={
        <BannerAction variation="primary" onClick={getIsWin10 ? () => navigate() : undefined}>
          {openInEdge}
        </BannerAction>
      }
    >
      {heading && <BannerHeadline>{heading}</BannerHeadline>}
      <BannerParagraph>{children}</BannerParagraph>
    </Banner>
  ) : null
}

export default IEBanner
