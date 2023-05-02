import styled from "@emotion/styled"
import { color, fontSize } from "styled-system"
import React from "react"
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "./LightButton"

export const ShareChart = ({ chartRef }) => {
  function handleCsvDownloadClick() {
    chartRef.current.downloadCSV()
  }
  function handleScreenshotDownloadClick() {
    chartRef.current.exportChart()
  }

  return (
    <ShareContainer>
      <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
      <ExportDataButton onClick={handleCsvDownloadClick} />
      <IframeButton />
    </ShareContainer>
  )
}

export const ShareContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: auto;
  margin-top: 3rem;
  > * {
    margin: 0 0.4rem;
    &:first-of-type {
      margin-left: 0;
    }
  }
  ${color}
  ${fontSize}
`
