import styled from '@emotion/styled'

const ExampleContainer = styled.div<{ headline?: string; dark?: boolean }>`
  background-color: ${(p) => (p.dark ? '#002b45' : 'white')};
  padding: 25px 15px 15px;
  margin-bottom: 16px;
  border: 1px solid #f4f6f8;
  position: relative;

  ::before {
    position: absolute;
    top: 2px;
    content: '${(p) => p.headline || 'example'}';
    right: 2px;
    font-size: 10px;
    padding: 4px 8px;
    color: ${(p) => (p.dark ? 'white' : 'black')};
    background-color: ${(p) => (p.dark ? '#031c2b' : '#eee')};
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
`

export default ExampleContainer
