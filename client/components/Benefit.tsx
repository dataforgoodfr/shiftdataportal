import Icons from "../components/Icons";
import { useTheme } from "@emotion/react";
import { typography, space, layout } from "styled-system";
import React from "react";
import styled from "@emotion/styled"
/*interface IProps {
  index: number;
  color: string;
  title: string;
  icon: "Share" | "Table" | "Gear" | "MagnifyingGlass";
}*/
const ovals = [Icons.Oval1, Icons.Oval2, Icons.Oval3, Icons.Oval4];
const Benefit = ({ index, color, title, children, icon }) => {
  const theme = useTheme();

  return (
    <Container width={[0.44, 0.44, 0.2]}>
      {/* {Icons["Gear"]({ color: "black" })} */}
      <IconContainer>
        <Oval>{ovals[index]({ color: theme.colors[color], opacity: 0.1 })}</Oval>
        <Icon>
          {icon === "Share" && Icons.Share({ color: theme.colors[color] })}
          {icon === "Gear" && Icons.Gear({ color: theme.colors[color] })}
          {icon === "MagnifyingGlass" && Icons.MagnifyingGlass({ color: theme.colors[color] })}
          {icon === "Table" && Icons.Table({ color: theme.colors[color] })}
        </Icon>
      </IconContainer>
      <H4 fontSize={[6]} mt={[3]}>
        {title}
      </H4>
      <Body>{children}</Body>
    </Container>
  );
};
const Container = styled.div`
  ${layout};
  max-width: 15rem;
  margin-top: 4rem;
`;

const IconContainer = styled.div`
  position: relative;
  max-width: 90px;
`;

const Icon = styled.div`
  position: absolute;
  z-index: 1;
  width: 40%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const Oval = styled.div`
  position: float;
  z-index: -1;
  width: 100%;
`;
const H4 = styled.h4`
  ${space}
  ${typography}
  font-weight: 700;
  font-size: 20px;
  color: ${p => p.theme.colors.grey};
  letter-spacing: 0.49px;
`;

const Body = styled.p`
  margin-top: 1rem;
  color: ${p => p.theme.colors.grey};
  letter-spacing: 0.4px;
`;
export default Benefit;
