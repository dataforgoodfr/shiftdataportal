import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import Clipboard from "react-clipboard.js";
import { fontSize, layout } from "styled-system";
import Icons, { IconName } from "./Icons";
import { useTheme } from "@emotion/react";
import popup from "../styles/popup";

const Button = styled.div`
  ${layout};
  align-items: center;
  background: #ffffff;
  border-radius: 3px; 
  border: 1px solid #dfdfdf;
  color: ${p => p.theme.colors.darkBlue};
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  font: inherit;
  justify-content: center;
  flex-flow: row nowrap;
  align-items: center;
  min-height: 52px;
  outline: inherit;
  padding: 0;
  position: relative;
  text-align: center;
  transition: all 0.2s ease-out;
  padding: 0.5rem 1rem;
  div {
    svg {
      path {
        transition: all 0.2s ease-out;
      }
    }
  }
  &:hover {
    box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.1);
    background-color: ${p => p.theme.colors.darkBlue};
    color: white;
    div {
      svg {
        path {
          fill: white;
        }
      }
    }
  }
  span {
    flex: 1;
    padding: 0.2rem 1rem;
  }
  button {
    border: none;
    padding: 0;
    width: auto;
    overflow: visible;
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: normal;
    cursor: pointer;
    width: 100%;
  }
  ${fontSize}
`;
const IconContainer = styled.div`
  display: flex;
  align-items: center;
  svg {
    width: 1.8rem;
  }
`;
const CopyButton = styled.div`
  background-color: #333;
  padding: 5px;
  border: 0;
  border-radius: 2px;
  color: white;
  transition: all 0.3s ease-out;
  border: 1px #333 solid;
  &:hover {
    background-color: white;
    color: black;
  }
`;
export interface IProps {
  onClick?: any;
  icon?: IconName;
}
const LightButton: React.FC<IProps> = props => {
  const theme = useTheme();
  let Icon;
  switch (props.icon) {
    case "Iframe":
      Icon = Icons.Iframe({ color: theme.colors.darkBlue });
      break;
    case "Screenshot":
      Icon = Icons.Screenshot({ color: theme.colors.darkBlue });
      break;
    case "Table":
      Icon = Icons.Table({ color: theme.colors.darkBlue });
      break;
    default:
      Icon = null;
  }
  return (
    <Button fontSize={[4]} minWidth={["null", "140px"]} {...props}>
      {Icon && <IconContainer>{Icon}</IconContainer>}
      <Span display={["none", "initial"]}>{props.children}</Span>
    </Button>
  );
};
const Span = styled.span`
  ${layout};
`;
export const DownloadScreenshotButton = props => (
  <LightButton icon="Screenshot" onClick={props.onClick}>
    Save Image
  </LightButton>
);
export const ExportDataButton = props => (
  <LightButton icon="Table" onClick={props.onClick}>
    Export Data
  </LightButton>
);
export const IframeButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const [chartHeight, setChartHeight] = useState("75vh");
  const [iframeUri, setIframeUri] = useState(
    typeof window !== "undefined" && window.location.href + "&iframe=true&chart-height=" + chartHeight
  );
  useEffect(() => {
    setIframeUri(window.location.href + "&iframe=true&chart-height=" + chartHeight);
  }, [chartHeight]);
  /*useOutsideClick(popupRef, () => {
    if (showPopup) {
      setShowPopup(false);
    }
  });*/
  return (
    <Container>
      {showPopup && (
        <Popup ref={popupRef}>
          Copy iframe URL and integrate it in you website.
          <div>
            <input type="url" value={iframeUri}></input>
            <Clipboard
              data-clipboard-text={iframeUri}
              style={{
                border: "none",
                padding: 0,
                width: "auto",
                overflow: "visible",
                background: "transparent",
                color: "inherit",
                font: "inherit",
                lineHeight: "normal",
                cursor: "pointer"
              }}
            >
              <CopyButton>Copy</CopyButton>
            </Clipboard>
          </div>
          <input type="text" onChange={e => setChartHeight(e.target.value)} value={chartHeight}></input>
        </Popup>
      )}
      <LightButton
        icon="Iframe"
        onClick={() => {
          setIframeUri(window.location.href + "&iframe=true&chart-height=" + chartHeight);
          setShowPopup(prevShow => !prevShow);
        }}
      >
        Integrate
      </LightButton>
    </Container>
  );
};
const Container = styled.div`
  position: relative;
`;
const Popup = styled.div`
  ${popup};
`;

export default LightButton;
