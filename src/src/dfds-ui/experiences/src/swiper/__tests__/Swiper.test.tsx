import React from 'react'
import { render } from '@testing-library/react'
import { Swiper, SwiperCard } from '../'

describe('<Swiper /> & <SwiperCard/>', () => {
  it('should render without errors', () => {
    render(
      <Swiper>
        <SwiperCard>1</SwiperCard>
        <SwiperCard>2</SwiperCard>
        <SwiperCard>3</SwiperCard>
      </Swiper>
    )
  })
})
