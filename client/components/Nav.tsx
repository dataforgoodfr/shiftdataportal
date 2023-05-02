/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react"
import Link from "next/link"
import { flexbox, layout, padding, space, typography } from "styled-system"
import { useTheme } from "@emotion/react"
import { Fragment } from "react"
import styled from "@emotion/styled"

const Nav = ({ mt = 4 }) => {
  const theme = useTheme()
  return (
    <Fragment>
      <Banner>
        This is an alpha version for testing purposes, it's not final and may contain errors.{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://airtable.com/shryDaSBKJZrun8Re"
          style={{ textDecoration: "underline" }}
        >
          Your feedback is welcome.
        </a>
      </Banner>
      <div>
        <Container
          flexDirection={["column", "row"]}
          justifyContent="space-between"
          display="flex"
          px={theme.mainPaddingX}
          mt={mt}
        >
          <Link href="/" aria-label="Homepage">
            <TsdLogoSquare />
          </Link>
          <Ul marginTop={[2, 0]}>
            <li>
              <CategoryLink href="/energy" fontSize={4} bubblecolor={theme.colors.orange}>
                ENERGY
              </CategoryLink>
            </li>
            <li>
              <CategoryLink href="/climate" fontSize={4} bubblecolor={theme.colors.blue}>
                CLIMATE
              </CategoryLink>
            </li>
            <li>
              <CategoryLink href="/about" fontSize={4} bubblecolor={theme.colors.lightGrey}>
                ABOUT
              </CategoryLink>
            </li>
          </Ul>
        </Container>
      </div>
    </Fragment>
  )
}
const Ul = styled.ul`
  ${space};
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
`
const Container = styled.nav`
  ${flexbox};
  ${layout};
  ${space};
`
const CategoryLink = styled(Link)<{ bubblecolor: string }>`
  ${space}
  ${typography}
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  align-items: center;
  padding: 6px 16px;
  font-weight: 700;
  letter-spacing: 0.4px;
  &:hover::before {
    transform: translateX(-70%);
  }
  &::before {
    content: "";
    position: absolute;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    background-color: ${(p) => p.bubblecolor};
    transition: transform 0.3s;
    left: 2px;
  }
`
const TsdLogoSquare = () => {
  const theme = useTheme()
  return (
    <StyledTsdLogoSquare viewBox="0 0 132 53" xmlns="http://www.w3.org/2000/svg">
      <g fillRule="nonzero" fill="none">
        <g fill={theme.colors.darkBlue}>
          <path d="M14 0v5h-3.801v20H3.79V5H0V0zM32 0v25h-6.525V14.48h-1.95v10.48H17V0h6.525v8.93h1.95V0zM36 0h10.542v5.008h-4.219v4.738h3.898v4.757h-3.898v5.489H47V25H36zM71.441 8.082h-6.056V6.233a3.488 3.488 0 00-.232-1.65.85.85 0 00-.777-.36 1.012 1.012 0 00-.898.48 2.757 2.757 0 00-.303 1.45 4.133 4.133 0 00.313 1.85 5.036 5.036 0 001.857 1.529c2.907 1.706 4.74 3.112 5.5 4.219.761 1.106 1.141 2.889 1.141 5.348a9.217 9.217 0 01-.636 3.899 4.891 4.891 0 01-2.432 2.109 9.708 9.708 0 01-4.199.89 9.452 9.452 0 01-4.492-1 4.84 4.84 0 01-2.432-2.51 12.77 12.77 0 01-.575-4.328v-1.62h6.056v3a3.964 3.964 0 00.252 1.81c.21.281.556.433.908.399.408.035.8-.163 1.01-.51.223-.46.32-.97.282-1.48.117-.999-.095-2.008-.605-2.878a18.809 18.809 0 00-3.028-2.27 28.355 28.355 0 01-3.24-2.329 5.413 5.413 0 01-1.312-2 8.602 8.602 0 01-.525-3.278 9.08 9.08 0 01.736-4.189 5.033 5.033 0 012.393-2.06 9.579 9.579 0 014.037-.749c1.49-.043 2.971.237 4.34.82a4.51 4.51 0 012.382 2.05 10.74 10.74 0 01.586 4.218l-.05.99zM90 0v25h-6.52V14.48h-1.94v10.48H75V0h6.54v8.93h2.011V0zM101 0v25h-7V0zM105 0h11v5.008h-4.5v4.738h4v4.757h-4V25h-6.49zM132 0v5h-3.801v20h-6.408V5H118V0z" />
        </g>
        <path
          d="M3.892 32.364a18.885 18.885 0 013.638-.35 6.04 6.04 0 014.989 2.075 8.16 8.16 0 011.46 5.265c0 5.083-2.17 9.715-4.38 11.615a8.769 8.769 0 01-6.13 2.016A15.388 15.388 0 010 52.635l3.892-20.27zm-.355 17.838c.365.068.735.104 1.106.109 1.41 0 2.895-.9 3.993-2.7a17.133 17.133 0 002.11-8.54c0-2.5-.844-4.507-3.157-4.507a4.412 4.412 0 00-1.021.083L3.537 50.202zM18.995 47.43l-2.057 5.528H14L22.173 32h3.435L26 53h-2.906l-.04-5.527-4.059-.042zm4.131-2.376v-4.99c0-1.352.096-3.36.12-4.956h-.088c-.496 1.596-1.113 3.68-1.601 4.956l-1.801 4.99h3.37zM33.672 34.93H30l.565-2.93H41l-.565 2.93h-3.656L33.39 53h-3.107zM42.986 47.43l-2.052 5.528H38L46.168 32H49.6L50 53h-2.918v-5.527l-4.096-.042zm4.128-2.376v-4.99c0-1.352.088-3.36.112-4.956h-.088c-.497 1.596-1.114 3.68-1.603 4.956l-1.812 4.99h3.391zM57.816 32.352A20.202 20.202 0 0161.509 32c1.315 0 3.202.327 4.305 1.584A5.459 5.459 0 0167 37.087a8.491 8.491 0 01-2.377 5.94 7.315 7.315 0 01-4.993 1.962c-.38.002-.759-.023-1.135-.076L56.99 53H54l3.816-20.648zm1.168 9.939c.301.059.608.087.915.083 2.925 0 4.004-2.975 4.004-5.028 0-1.617-.679-2.74-2.452-2.74a4.21 4.21 0 00-1.03.1l-1.437 7.585zM82 38.578c0 4.111-1.413 9.867-4.083 12.58A5.698 5.698 0 0173.728 53C69.523 53 69 48.626 69 46.422c0-4.07 1.42-9.867 4.23-12.613A5.77 5.77 0 0177.378 32C81.535 32 82 36.07 82 38.578zm-6.655-3.083c-2.058 2.088-3.185 8.016-3.185 11.05 0 1.423.114 3.742 2.025 3.742a2.207 2.207 0 001.52-.74c2.163-2.196 3.135-8.848 3.135-11.117 0-1.809-.163-3.708-1.895-3.708a2.297 2.297 0 00-1.6.773zM87.875 32.368a20.022 20.022 0 013.693-.352 5.735 5.735 0 014.18 1.381 4.725 4.725 0 011.25 3.348c.062 2.81-1.627 5.354-4.212 6.345v.075c1.16.52 1.711 1.825 1.76 4.344-.015 1.836.092 3.67.321 5.491h-3.093a46.365 46.365 0 01-.18-5.072c-.042-2.704-.626-3.675-2.173-3.675h-.773L87.003 53H84l3.875-20.632zm1.267 9.433h.954c2.163 0 3.718-2.193 3.718-4.746 0-1.314-.567-2.51-2.237-2.51a4.046 4.046 0 00-1.127.125l-1.308 7.13zM103.672 34.963H100l.565-2.963H111l-.523 2.963h-3.656L103.423 53h-3.107zM112.396 47.43l-2.217 5.528H107L115.86 32h3.707L120 53h-3.153l-.043-5.527-4.408-.042zm4.469-2.376v-4.99c0-1.352.095-3.36.121-4.956h-.095c-.537 1.596-1.204 3.68-1.732 4.956l-1.897 4.99h3.603zM126.94 32h3.14l-3.457 18.248H132L131.466 53H123z"
          fill={theme.colors.orange}
        />
      </g>
    </StyledTsdLogoSquare>
  )
}
const StyledTsdLogoSquare = styled.svg`
  width: 132px;
`
const Banner = styled.div`
  background-color: rgba(255, 0, 0, 0.1);
  color: black;
  padding: 0.2rem 1rem;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
`

export default Nav
