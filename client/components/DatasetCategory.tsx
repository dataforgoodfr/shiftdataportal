import styled from "../lib/styled";
import { Icons } from ".";
import { typography, space } from "styled-system";
import ReactTooltip from "react-tooltip";

import React, { Fragment } from "react";
import { IconName } from "./Icons";

interface IProps {
  tooltip: string;
  children: any;
  color: string;
  icon: IconName;
  index: number;
}
export default function DatasetCategory({ tooltip, children, color, icon, index }: IProps) {
  const Icon = iconNameToIconComponent(icon, "white");
  return (
    <Container>
      <IconContainer>{Icon}</IconContainer>
      <div>
        <Title color={color} px={[1]} mx={[2]}>
          <span dangerouslySetInnerHTML={{ __html: children }}></span>
        </Title>
      </div>
      {tooltip && (
        <Fragment>
          <TooltipButton data-tip data-for={index}>
            ?
          </TooltipButton>
          <ReactTooltip id={index.toString()} aria-haspopup="true" effect="solid">
            <div style={{ width: "20rem", textAlign: "center" }}>{tooltip}</div>
          </ReactTooltip>
        </Fragment>
      )}
    </Container>
  );
};
export const iconNameToIconComponent = (icon: IconName, color: string) => {
  switch (icon) {
    case "EnergyConsumption":
      return Icons.EnergyConsumption({ color });
    case "EnergyProduction":
      return Icons.EnergyProduction({ color });
    case "Energy":
      return Icons.Energy({ color });
    case "Electricity":
      return Icons.Electricity({ color });
    case "FossilFuels":
      return Icons.FossilFuels({ color });
    case "Renewables":
      return Icons.Renewables({ color });
    case "Nuclear":
      return Icons.Nuclear({ color });
    case "Footprint":
      return Icons.Footprint({ color });
    case "CO2":
      return Icons.CO2({ color });
    case "Gas":
      return Icons.Gas({ color });
    case "Coal":
      return Icons.Coal({ color });
    case "Fire":
      return Icons.Fire({ color });
    default:
      console.warn(`Dimension Icon : ${icon} not found, fallbacking to the line chart icon`);
      return Icons.LineChart({ color });
  }
};

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;
const IconContainer = styled.div`
  background-color: ${p => p.theme.colors.darkBlue};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  padding: 0.4rem;
  svg {
    width: 2rem;
  }
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

const Title = styled.h2`
  ${typography};
  ${space}
  height: auto;
  font-size: ${p => p.theme.fontSizes[7]};
  font-weight: 700;
  span {
    color: ${p => p.theme.colors.darkBlue};
  }
`;
