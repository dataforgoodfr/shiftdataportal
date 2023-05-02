import React from "react"
import styled from "@emotion/styled"
import { color, fontSize } from "styled-system"

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: auto;
  margin-top: 3rem;
  > * {
    margin: 0 0.4rem;
    &:first-of-type {
      margin-left: 0;
    }
  }
  ${color}
  ${fontSize}
`
const Share: React.FC = ({ children }) => (
  <Container fontSize={[4]} color="lightBlack">
    {children}
  </Container>
)

export default Share
