import React from "react"
import { typography, layout, space } from "styled-system"
import styled from "@emotion/styled"

interface IProps {
  mt?: any
  overTitle?: string
  children: string
  subTitle?: string
}
const H2: React.FC<IProps> = ({ mt = 6, overTitle, children, subTitle }) => {
  return (
    <Container mt={mt}>
      {overTitle && <OverTitle fontSize={[2]}>{overTitle}</OverTitle>}
      <Title fontSize={[9]} color="lightBlack" width={["100%", 0.6]}>
        {children}
      </Title>
      {subTitle && (
        <SubTitle fontSize={[4]} mt={[2]} width={["100%", 0.5]}>
          {subTitle}
        </SubTitle>
      )}
    </Container>
  )
}
const Container = styled.div`
  ${space}
`

const OverTitle = styled.div`
  ${typography}
  font-weight: 700;
  color: ${(p) => p.theme.colors.darkOrange};
  letter-spacing: 0.3px;
`
const Title = styled.h2`
  ${typography}
  ${layout}
  font-weight: bold;
  color: ${(p) => p.theme.colors.lightBlack};
  letter-spacing: 0.89px;
  line-height: 52px;
`
const SubTitle = styled.p`
  ${typography}
  ${layout}
  color: ${(p) => p.theme.colors.grey};
  letter-spacing: 0.4px;
`

export default H2
