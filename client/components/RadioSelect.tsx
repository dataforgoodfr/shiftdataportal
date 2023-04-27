import React, { useState, useRef } from "react";
import styled from "@emotion/styled"
import { typography, space } from "styled-system";
import useOutsideClick from "../hooks/useOutsideClick";
import button1 from "../styles/button1";
import popup from "../styles/popup";
import Radio from "./Radio";
import { InputSubtitle } from ".";

interface IProps {
  options: (string | number)[];
  selectedOption: string | number;
  onChange: any;
  isLoading?: boolean;
  inputName: string;
  label: string;
}
const RadioSelect: React.FC<IProps> = ({ options, selectedOption, onChange, isLoading = false, inputName, label }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  // Hide popup when clicked outside popup.
  useOutsideClick(popupRef, () => {
    if (showPopup) {
      setShowPopup(false);
    }
  });
  return (
    <Container mx={[1]}>
      <InputSubtitle>{label}</InputSubtitle>
      <Title onClick={() => setShowPopup(!showPopup)} fontSize={[3]} px={[3]}>
        {isLoading ? "loading..." : selectedOption}
      </Title>
      {showPopup && (
        <Popup ref={popupRef} style={{ display: showPopup ? "block" : "none" }}>
          <PopupTitle>{inputName}</PopupTitle>
          <Options mt={[1]}>
            {options.map((option, i) => (
              <Radio
                key={i}
                uniqueName={inputName}
                selectedValue={selectedOption}
                onChange={newOption => {
                  onChange(newOption);
                }}
              >
                {option}
              </Radio>
            ))}
          </Options>
        </Popup>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${space};
  position: relative;
`;
export const Title = styled.div`
  font-family: ${p => p.theme.fonts.secondary};
  ${typography};
  ${space};
  ${button1};
  transition: all 0.1s ease-in;
  &::first-letter {
    text-transform: capitalize;
  }
  &:hover {
    border: 1px solid ${p => p.theme.colors.grey};
  }
`;

const Popup = styled.div`
  ${popup};
`;
export const PopupTitle = styled.h4`
  ${space};
  font-weight: 700;
  text-align: center;
  &::after {
    content: "";
    display: block;
    margin-top: 1rem;
    height: 1px;
    width: 100%;
    transform: scaleX(1.2);
    background-color: ${p => p.theme.colors.lightGrey};
  }
`;
const Options = styled.div`
  ${space};
  position: relative;
  width: 21rem;
  display: flex;
  flex-flow: row wrap;
  & > * {
    min-width: 50%;
  }
`;

export default RadioSelect;
