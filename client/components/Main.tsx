import React from "react"
import styled from "@emotion/styled"
import { space, width, layout } from "styled-system"
import { useTheme } from "@emotion/react"

const StyledMain = styled.main`
  ${width};
  ${space};
  ${layout};
  max-width: 80rem;
  margin: auto;
`
const Main: React.FC = ({ children }) => {
  const theme = useTheme()
  return <StyledMain px={theme.mainPaddingX}>{children}</StyledMain>
}

export default Main
