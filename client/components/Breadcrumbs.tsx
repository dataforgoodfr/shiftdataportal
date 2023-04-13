import Link from "next/link";
import React from "react";
import styled from "@emotion/styled";
import { color, fontSize, space } from "styled-system";

const StyledBreadcrumbs = styled.ul`
  ${fontSize}
  ${color}
  ${space}
  padding: 0;
  margin: auto;
  list-style-type: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  a {
    opacity: 0.7;
    text-decoration: none;
    color: inherit;
    display: flex;
    padding: 0.6rem 0;
    padding-left: 0.2rem;
    justify-content: center;
    transition: opacity .2s ease-out; 
    &:hover {
      opacity: 1;
    }
  }
`;
export interface Breadcrumb {
  name: string;
  href: string;
}
export interface IProps {
  data: Array<Breadcrumb>;
}
const Breadcrumbs: React.FC<IProps> = ({ data }) => (
  <StyledBreadcrumbs fontSize={[2]} color="grey">
    {data.map((breadcrumb, index) => (
      <li key={index}>
        <Link href={breadcrumb.href} passHref>
          <a>
            {breadcrumb.name}
            {index === data.length - 1 ? "" : " >"}
            {index === data.length - 1 ? "..." : ""}
          </a>
        </Link>
      </li>
    ))}
  </StyledBreadcrumbs>
);
export default Breadcrumbs;
