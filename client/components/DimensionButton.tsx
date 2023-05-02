import React from "react"
import { Icons } from "../components"
import { useTheme } from "@emotion/react"
import { space, typography } from "styled-system"
import button1 from "../styles/button1"
import { IconName } from "./Icons"
import styled from "@emotion/styled"
interface IProps {
  href?: string
  icon: IconName
  children: any
  selected?: boolean
  active: boolean
}

const DimensionButton = ({ href, children, icon, selected = false, active }: IProps) => {
  const theme = useTheme()
  let Icon
  switch (icon) {
    case "LineChart":
      Icon = Icons.LineChart({ color: theme.colors.orange })
      break
    case "StackedChart":
      Icon = Icons.StackedChart({ color: theme.colors.orange })
      break
    case "Capita":
      Icon = Icons.Capita({ color: theme.colors.orange })
      break
    case "PieChart":
      Icon = Icons.PieChart({ color: theme.colors.orange })
      break
    case "Dollar":
      Icon = Icons.Dollar({ color: theme.colors.orange })
      break
    case "TopChart":
      Icon = Icons.TopChart({ color: theme.colors.orange })
      break
    case "ProvenReserves":
      Icon = Icons.ProvenReserves({ color: theme.colors.orange })
      break
    case "ImportExport":
      Icon = Icons.ImportExport({ color: theme.colors.orange })
      break
    default:
      console.warn(`Dimension Icon : ${icon} not found, fallback to the line chart icon`)
      Icon = Icons.LineChart({ color: theme.colors.orange })
  }
  const Container = A.withComponent("div")
  if (href) {
    return (
      <A color="blue" py={["5px"]} px={[3]} mt={[2]} mr={[2]} active={active} href={href}>
        <IconContainer>{Icon}</IconContainer>
        <Title pl={[2]} fontSize={[3]}>
          {children}
        </Title>
      </A>
    )
  } else {
    return (
      <Container selected={selected} py={["5px"]} px={[3]} mt={[1]} mx={[1]} active>
        <IconContainer>{Icon}</IconContainer>
        <Title pl={[2]} fontSize={[3]}>
          {children}
        </Title>
      </Container>
    )
  }
}

export default DimensionButton
type AProps = {
  selected: boolean
}
const disabledA = () => `
  cursor: not-allowed;
  opacity: 0.3;
`
const A = styled.a`
  ${space};
  ${button1};
  ${(p) => (p.active ? null : disabledA)};
  /* border: ${(p: AProps) => (p.selected ? "1px solid black" : `1px solid ${(p) => p.theme.colors.lightGrey}`)}; */
  background-color: ${(p) => (p.selected ? p.theme.colors.blue : "white")};
  color: ${(p) => (p.selected ? "white" : p.theme.colors.darkBlue)};
  path,
  circle,
  rect {
    fill: ${(p) => (p.selected ? "white" : p.theme.colors.darkBlue)};
  }
  transition: all 0.2s ease-in;
  font-weight: inherit;
  &:first-of-type {
    margin-left: 0;
  }
  &:hover {
    border: 1px solid ${(p) => (p.active ? p.theme.colors.darkBlue : `1px solid ${(p) => p.theme.colors.lightGrey}`)};
    border: 1px solid #c4cfff;
    background-color: ${(p) => p.theme.colors.blue};
    color: white;
    path,
    circle,
    rect {
      fill: white;
    }
  }
`

const IconContainer = styled.div`
  svg {
    display: block;
    width: 18px;
  }
`
const Title = styled.div`
  ${space}
  ${typography}
  font-family: ${(p) => p.theme.fonts.secondary};
  &::first-letter {
    text-transform: capitalize;
  }
`
