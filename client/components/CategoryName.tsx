import React from "react";
import Link from "next/link";
import styled from "../lib/styled";
import { typography, space } from "styled-system";

interface IProps {
  type: "ENERGY" | "CLIMATE";
}
const CategoryName: React.FC<IProps> = ({ type }) => (
  <Link href={type === "CLIMATE" ? "/climate" : "/energy"} passHref>
    <StyledA type={type} fontSize={[2]} mt={[4]}>
      {type}
    </StyledA>
  </Link>
);

const StyledA = styled.a`
  ${typography};
  ${space};
  display: block;
  color: ${(p: any) => (p.type === "CLIMATE" ? p.theme.colors.darkBlue : p.theme.colors.darkBlue)};
  font-weight: 700;
  letter-spacing: 0.3px;
`;
export default CategoryName;
