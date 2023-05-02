import React from "react"
import styled from "@emotion/styled"
import { color, space, SpaceProps } from "styled-system"

const StyledH1 = styled.h1`
  position: relative;
  font-size: 28px;
  font-weight: 400;
  ${color};
  ${space};
  &::before {
    content: "";
    width: 50px;
    height: 6px;
    margin-bottom: 4px;
    display: block;
    background-color: ${(p) => p.theme.colors.darkBlue};
  }
`
interface IProps extends SpaceProps {}

const H1: React.FC<IProps> = (props) => (
  <StyledH1 color="darkBlue" {...props}>
    {props.children}
  </StyledH1>
)
export default H1
