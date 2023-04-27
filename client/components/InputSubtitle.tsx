import styled from "@emotion/styled"
import { typography, space } from "styled-system";

export default styled.div`
  font-size: ${p => p.theme.fontSizes[2]};
  margin-bottom: ${p => p.theme.space[1]}px;
  color: ${p => p.theme.colors.darkBlue};
  font-weight: 700;
  text-transform: uppercase;
  ${space};
  ${typography};
`;
