import React, { Fragment } from "react";
import ReactTooltip from "react-tooltip";
import { space } from "styled-system";
import styled from "@emotion/styled"
export default function SubCategoryTitle({ children, tooltip }) {
  const randomId = Math.random().toString();
  return (
    <Container mt={[2]}>
      <Title mt={[2]}>
        <span>{children}</span>
      </Title>
     {/* {tooltip && (
        <Fragment>
          <TooltipButton data-tip data-for={randomId}>
            ?
          </TooltipButton>
          <ReactTooltip id={randomId} aria-haspopup="true"  effect="solid">
            <div style={{ width: "20rem", textAlign: "center" }}>{tooltip}</div>
          </ReactTooltip>
        </Fragment>
      )}*/}
    </Container>
  );
};
const Container = styled.div`
  ${space};
  display: flex;
  flex-flow: row nowrap;
`;
const Title = styled.h3`
  ${space};
  font-weight: 700;
`;

const TooltipButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${p => p.theme.colors.grey};
  border: 1px solid ${p => p.theme.colors.grey};
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
  font-size: 12px;
  line-height: 100%;
`;
