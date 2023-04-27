import makeAnimated from "react-select/animated";
import React, { useMemo, useState, useRef, Fragment } from "react";
import chroma from "chroma-js";
import { NameColor } from "../types";
import { Theme } from "../lib/styled";
import { space, layout } from "styled-system";
import popup from "../styles/popup";
import { Title, PopupTitle } from "./RadioSelect";
import Select, { components, StylesConfig } from "react-select";
import useOutsideClick from "../hooks/useOutsideClick";
import { InputSubtitle } from ".";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled"
interface IProps {
  types: NameColor[];
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  isLoading?: boolean;
  typeName: string;
  label: string;
  [key: string]: any;
}
export const menuHeaderStyle = {
  margin: "1rem 1rem",
  fontWeight: 700,
  fontSize: "1rem",
  color: "#292929",
};
function getLength(options) {
  return options.reduce((acc, curr) => {
    if (curr.options) return acc + getLength(curr.options);
    return acc + 1;
  }, 0);
}
export const Menu = (props) => {
  const optionsLength = getLength(props.options);
  return (
    <Fragment>
      <div style={menuHeaderStyle}>Options ({optionsLength})</div>
      <components.Menu {...props}>{props.children}</components.Menu>
    </Fragment>
  );
};
const TypesInput: React.FC<IProps> = ({
  types = [],
  selectedTypes = [],
  setSelectedTypes,
  isLoading = false,
  typeName,
  label,
}) => {
  const theme = useTheme<Theme>();
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  useOutsideClick(popupRef, () => {
    if (showPopup) {
      setShowPopup(false);
    }
  });
  const computedTypes = useMemo(() => {
    return types.map((type) => ({ value: type.name, label: type.name, color: type.color }));
  }, [types]);
  const computedSelectedTypes = useMemo(
    () => selectedTypes.map((type) => computedTypes.find(({ value }) => type === value)),
    [selectedTypes, computedTypes]
  );
  return (
    <Container mx={[1]}>
      <InputSubtitle>{label}</InputSubtitle>
      <Title onClick={() => setShowPopup(!showPopup)} px={[3]} py={[2]} fontSize={[3]}>
        {isLoading
          ? "loading..."
          : computedSelectedTypes.length > 1
          ? `${typeName} · ${computedSelectedTypes.length}`
          : computedSelectedTypes && computedSelectedTypes[0] && computedSelectedTypes[0].label
          ? computedSelectedTypes[0].label
          : "0 selected"}
      </Title>
      {showPopup && (
        <Popup show={showPopup} ref={popupRef} width={["90vw", "90vw"]} maxWidth={["1rem", "30rem"]}>
          <PopupTitle mt={[3]}>
            {computedSelectedTypes.length > 1 ? `${typeName} · ${computedSelectedTypes.length}` : typeName}
          </PopupTitle>
          {showPopup && (
            <Select
              menuIsOpen={true}
              menuPlacement="bottom"
              closeMenuOnSelect={false}
              openMenuOnFocus={true}
              isLoading={isLoading}
              components={makeAnimated()}
              isMulti
              isClearable={true}
              defaultValue={computedTypes}
              className="basic-multi-select"
              classNamePrefix="types"
              name="types"
              aria-label="types"
              styles={colourStyles(theme)}
              instanceId="types"
              options={computedTypes}
              value={computedSelectedTypes}
              onChange={(selectedTypes: { label: string; value: string; color: string }[]) => {
                if (selectedTypes) {
                  setSelectedTypes(selectedTypes.map(({ value }) => value));
                } else {
                  setSelectedTypes([]);
                }
              }}
            />
          )}
          <PopupControls p={[3]} mt={[2]}>
            <OkButton px={[3]} onClick={() => setShowPopup(false)}>
              OK
            </OkButton>
          </PopupControls>
        </Popup>
      )}
    </Container>
  );
};
const colourStyles = (theme: Theme): StylesConfig => ({
  menu: (provided) => ({ ...provided, position: "static", boxShadow: null }),
  container: (provided) => ({ ...provided, width: "100%" }),
  control: (provided) => ({ ...provided, margin: "8px" }),
  dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
  indicatorSeparator: (provided) => ({ ...provided, display: "none" }),
  indicatorsContainer: (provided) => ({
    ...provided,
    backgroundColor: theme.colors.darkBlue,
    svg: { path: { fill: "white" } },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = data.color ? chroma(data.color) : chroma("grey");
    return {
      ...styles,
      backgroundColor: isDisabled ? null : isSelected ? data.color : isFocused ? color.alpha(0.1).css() : null,
      color: isDisabled ? "#ccc" : isSelected ? (chroma.contrast(color, "white") > 2 ? "white" : "black") : data.color,
      cursor: isDisabled ? "not-allowed" : "default",

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
      },
    };
  },
  multiValue: (styles, { data }) => {
    const color = data.color ? chroma(data.color) : chroma("grey");
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
});
const Container = styled.div`
  ${space};
  position: relative;
`;
type PopupProps = {
  show: boolean;
};
const Popup = styled.div`
  ${layout};
  ${popup};
  padding: 0;
  display: ${(p: PopupProps) => (p.show ? "block" : "none")};
`;
const PopupControls = styled.div`
  ${space};
  width: 100%;
  display: flex;
  justify-content: flex-end;
  position: relative;
  box-sizing: border-box;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 100%;
    transform: scaleX(1.2);
    background-color: ${(p) => p.theme.colors.lightGrey};
  }
`;
const OkButton = styled.button`
  ${space};
  font: inherit;
  cursor: pointer;
  outline: inherit;
  background: ${(p) => p.theme.colors.lightBlack};
  color: white;
  text-align: center;
  border: 1px solid ${(p) => p.theme.colors.grey};
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.4px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
`;

export default TypesInput;
