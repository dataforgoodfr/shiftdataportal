import { css } from "@emotion/react"
export default function Popup() {
  return css`
    max-width: 90vw;
    z-index: 1;
    opacity: 1;
    position: absolute;
    padding: 20px;
    top: -35px;
    border-radius: 1px;
    transition: all 0.5s;
    transform: translateY(100px);
    will-change: opacity;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #d9d9d9;
    box-shadow: 0 15px 46px -10px rgba(26, 26, 29, 0.3);
  `
}
