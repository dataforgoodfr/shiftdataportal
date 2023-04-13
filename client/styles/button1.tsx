import { css } from "@emotion/core";

export default function Button1() {
  return css`
    min-width: 6rem;
    min-height: 2.5rem;
    user-select: none;
    cursor: pointer;
    text-align: center;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border: 1px solid #e7eaf4;
    justify-content: center;
    background-color: white;
    box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
    border-radius: 1px;
    path,
    circle {
      transition: all 0.2s ease-in;
    }
    &:hover {
      box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.1);
    }
  `;
}
