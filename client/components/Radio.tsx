import styled from "@emotion/styled"
import { space } from "styled-system";
import React, { Fragment } from "react";
interface IProps {
  children: string | number;
  onChange: any;
  selectedValue: string | number;
  uniqueName: string;
}

const Radio: React.FC<IProps> = ({ children, onChange, selectedValue, uniqueName }) => (
  <Fragment>
    <HiddenInput
      type="radio"
      name={uniqueName}
      id={children.toString()}
      onChange={e => onChange(e.target.value)}
      value={children}
    />
    <Label htmlFor={children} mt={[2]}>
      <RadioButton selected={children === selectedValue} style={{ fontWeight: children === selectedValue ? 700 : 400 }}>
        <RadioIcon selected={children === selectedValue} />
        {children}
      </RadioButton>
    </Label>
  </Fragment>
);
export default Radio;
const HiddenInput = styled.input`
  display: none;
`;
const Label = styled.label`
  ${space};
  height: 100%;
  transition: opacity 0.1s ease-in;
  will-change: opacity;
  &:hover {
    opacity: 0.6;
  }
`;
const RadioButton = styled.div<RadioIconProps>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${p => (p.selected ? p.theme.colors.darkBlue : p.theme.colors.grey)};
`;
type RadioIconProps = {
  selected: boolean;
};
const RadioIcon = styled.div<RadioIconProps>`
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid ${p => p.theme.colors.lightBlack};
  margin-right: 0.5rem;
  &::after {
    content: "";
    position: absolute;
    width: ${p => (p.selected ? "7px" : "0px")};
    height: ${p => (p.selected ? "7px" : "0px")};
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${p => (p.selected ? p.theme.colors.darkBlue : p.theme.colors.lightBlack)};
  }
`;
