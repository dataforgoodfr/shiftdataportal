import React from "react"
import styled from "@emotion/styled"
import { color, fontSize, space } from "styled-system"

const Container = styled.p`
  letter-spacing: 0.44px;
  ${color}
  ${fontSize}
  ${space}
`
const SubHeading: React.FC = (props) => (
  <Container fontSize={5} color="grey" {...props} mt={3}>
    {props.children}
  </Container>
)

export default SubHeading
