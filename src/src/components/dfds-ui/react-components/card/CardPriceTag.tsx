import React from 'react'
import styled from '@emotion/styled'

const Wrapper = styled.div`
  position: absolute;
  padding: 0 20px 20px;
  text-align: right;
  transform: skewX(-30deg);
  padding: 0;
  background: #49a2df;
  bottom: 0;
  right: -30px;
`

const Content = styled.div`
  padding: 10px 50px 10px 30px;
  color: #fff;
  transform: skewX(30deg);
`

const Price = styled.span`
  font-family: DFDS;
  font-weight: 900;
  font-size: 40px;
  line-height: 40px;
`

const Currency = styled.span`
  padding-right: 5px;
  font-size: 30px;
  line-height: 30px;
  text-transform: uppercase;
`

const From = styled.span`
  display: block;
  color: #fff;
  font-size: 14px;
  line-height: 14px;
`

const Info = styled.span`
  display: block;
  color: #fff;
  font-size: 14px;
  line-height: 14px;
`

export type CardPriceTagProps = {
  /**
   * Price for the price tag
   */
  price: number

  /**
   * Currency symbol to be displayed
   */
  currency?: string

  /**
   * Text to be displayed over the price
   */
  topText?: string

  /**
   * Text to be displayed under the price
   */
  bottomText?: string

  /**
   * className to be assigned to the component
   */
  className?: string
}

const CardPriceTag = ({ price, topText, bottomText, currency, ...rest }: CardPriceTagProps) => (
  <Wrapper {...rest}>
    <Content>
      <From>{topText}</From>
      <Currency>{currency}</Currency>
      <Price>{price}</Price>
      <Info>{bottomText}</Info>
    </Content>
  </Wrapper>
)

export default CardPriceTag
