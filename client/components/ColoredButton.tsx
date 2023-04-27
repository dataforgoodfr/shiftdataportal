import React from "react";
import Link from "next/link";
import styled from "@emotion/styled"
import chroma from "chroma-js";
import { space } from "styled-system";
export default function ColoredButton({ color, children, href }) {
  return (
    <ContainerLink color={color} px={[4]} py={[3]} href={href} passHref>
      {children}
    </ContainerLink>

  );
}

const ContainerLink = styled(Link)`
  ${space};
  display: inline-block;
  box-sizing: border-box;
  background-color: white;
  border: 1px solid ${(p) => chroma(p.color).brighten(2).hex()};
  color: ${(p) => p.color};
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 1px 4px 0 ${(p) => chroma(p.color).brighten(2).darken(1).alpha(0.5).hex()};
  transition: 0.2s ease-out;
  &:hover {
    background-color: ${(p) => chroma(p.color).luminance(0.95).hex()};
    box-shadow: 0 1px 4px 0 ${(p) => chroma(p.color).darken(1).alpha(0.5).hex()};
    border: 1px solid ${(p) => p.color};
  }
`;
