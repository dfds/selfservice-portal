import styled from '@emotion/styled'

type PaperProps = {
  width?: number | string
}

const Paper = styled.div<PaperProps>`
  box-sizing: content-box;
  background-color: #eaf4fb;
  padding: 10px;
  width: ${({ width }) => (width === undefined ? 'auto' : typeof width === 'number' ? `${width}px` : width)};
`

export default Paper
