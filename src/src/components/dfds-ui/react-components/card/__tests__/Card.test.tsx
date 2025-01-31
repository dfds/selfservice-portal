import React from 'react'
import { render } from '@testing-library/react'
import Card from '../Card'
import CardMedia from '../CardMedia'
import CardTitle from '../CardTitle'
import CardContent from '../CardContent'
import CardActions from '../CardActions'
import { LinkButton } from '../../button'
import { ChevronRight } from '@/components/dfds-ui/icons/system'

// useDimensions uses window.requestAnimationFrame which will raise warnings when running multiple tests here
// in jest setup we set:
// global.requestAnimationFrame = fn => setTimeout(fn, 0)
// and use jest fake timers
// TODO: Consider mockingn useDimensions instead
jest.useFakeTimers()

describe('<Card />', () => {
  it('should render without errors', () => {
    render(
      <Card size="s" variant="fill">
        Some content.
      </Card>
    )
  })

  it('should render a complex card without errors', () => {
    render(
      <Card
        size="m"
        variant="outline"
        media={
          <CardMedia
            media={
              <img src="https://images.ctfassets.net/mivicpf5zews/685PmmGKZZmgswLpc581k2/263747f71fb717d345dbe3f5ee2a466e/STREETS-IN-COPENHAGEN_1200x600px_VISITCOPENHAGEN_PHOTO_MARTIN-HEIBERG_01.jpg?w=1000" />
            }
          />
        }
      >
        <CardTitle>Lorem ipsum</CardTitle>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam.'
        </CardContent>
        <CardActions>
          <LinkButton size="small" icon={<ChevronRight />} iconAlign="right">
            See offer
          </LinkButton>
        </CardActions>
      </Card>
    )
  })
})
