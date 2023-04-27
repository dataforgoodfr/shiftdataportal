import React from "react";
import styled from "@emotion/styled"
import { typography, space } from "styled-system";

export default function MainChartTitle(props) {return (
  <H1 fontSize={[9]} mt={[]} {...props}>
    {props.children}
  </H1>
);
}

const H1 = styled.h1`
  ${typography};
  ${space};
  font-weight: 700;

  color: ${p => p.theme.colors.orange};
  letter-spacing: 1.09px;
  line-height: 52px;
`;
