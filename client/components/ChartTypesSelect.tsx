import React from "react"
import { useTheme } from "@emotion/react"
import { ChartType } from "./StackedChart"
import { space } from "styled-system"
import { useRef, useState, useEffect } from "react"
import { InputSubtitle } from "."
import styled from "@emotion/styled"

const ChartTypesSelect = ({
  available,
  selected,
  onChange,
}: {
  available: ChartType[]
  selected: ChartType
  onChange: any
}) => {
  const [selectedLabelRef, setSelectedLabelRef] = useState(null)
  const [firstMount, setFirstMount] = useState(true)
  function chartTypeToLabelRef(chartType: ChartType) {
    switch (chartType) {
      case "line":
        return lineRef
      case "pie":
        return pieRef
      case "stacked":
        return stackedRef
      case "stacked-percent":
        return stackedPercentRef
      case "ranking":
        return rankingRef
      default:
        return stackedRef
    }
  }
  const movingBorderRef = useRef(null)
  const iconsRef = useRef(null)
  const stackedRef = useRef(null)
  const stackedPercentRef = useRef(null)
  const pieRef = useRef(null)
  const lineRef = useRef(null)
  const rankingRef = useRef(null)
  useEffect(() => {
    if (chartTypeToLabelRef(selected) && chartTypeToLabelRef(selected).current) {
      setSelectedLabelRef(chartTypeToLabelRef(selected))
      if (firstMount) {
        moveBorder(chartTypeToLabelRef(selected).current.getBoundingClientRect())
        setFirstMount(false)
      }
    }
  }, [selected, firstMount])
  useEffect(
    () => moveBorder(chartTypeToLabelRef(selected).current.getBoundingClientRect()),
    [selectedLabelRef, selected]
  )
  function moveBorder(rect) {
    movingBorderRef.current.style.left = `${rect.left - iconsRef.current.getBoundingClientRect().left}px`
  }
  const theme = useTheme()
  return (
    <Container id="chart-type-select" mb={[2, 1]} ml={["initial", "auto"]} mt={[3, 0]}>
      <InputSubtitle>Chart Type</InputSubtitle>
      <Icons ref={iconsRef} onMouseLeave={() => moveBorder(selectedLabelRef.current.getBoundingClientRect())}>
        <MovingBorder ref={movingBorderRef} style={{ opacity: firstMount ? 0 : 1 }} />
        <HiddenInput
          type="radio"
          name="chart-type-select"
          id="stacked"
          disabled={!available.includes("stacked")}
          onChange={() => onChange("stacked")}
        />
        <Label
          onMouseOver={() => {
            if (available.includes("stacked")) moveBorder(stackedRef.current.getBoundingClientRect())
          }}
          selected={selected.includes("stacked")}
          htmlFor="stacked"
          disabled={!available.includes("stacked")}
          ref={stackedRef}
        >
          <StackedChartIcon color={theme.colors.darkBlue} />
        </Label>
        <HiddenInput
          type="radio"
          name="chart-type-select"
          id="stacked-percent"
          disabled={!available.includes("stacked-percent")}
          onChange={() => onChange("stacked-percent")}
        />
        <Label
          onMouseOver={() => {
            if (available.includes("stacked-percent")) moveBorder(stackedPercentRef.current.getBoundingClientRect())
          }}
          selected={selected.includes("stacked-percent")}
          htmlFor="stacked-percent"
          disabled={!available.includes("stacked-percent")}
          ref={stackedPercentRef}
        >
          <StackedPercentChartIcon color={theme.colors.darkBlue} />
        </Label>
        <HiddenInput
          type="radio"
          name="chart-type-select"
          id="line"
          disabled={!available.includes("line")}
          onChange={() => onChange("line")}
        />
        <Label
          onMouseOver={() => {
            if (available.includes("line")) moveBorder(lineRef.current.getBoundingClientRect())
          }}
          ref={lineRef}
          selected={selected.includes("line")}
          htmlFor="line"
          disabled={!available.includes("line")}
        >
          <LineChartIcon color={theme.colors.darkBlue} />
        </Label>
        <HiddenInput
          type="radio"
          name="chart-type-select"
          id="pie"
          disabled={!available.includes("pie")}
          onChange={() => onChange("pie")}
        />
        <Label
          onMouseOver={() => {
            if (available.includes("pie")) moveBorder(pieRef.current.getBoundingClientRect())
          }}
          ref={pieRef}
          selected={selected.includes("pie")}
          htmlFor="pie"
          disabled={!available.includes("pie")}
        >
          <PieChartIcon color={theme.colors.darkBlue} />
        </Label>
        <HiddenInput
          type="radio"
          name="chart-type-select"
          id="ranking"
          disabled={!available.includes("ranking")}
          onChange={() => onChange("ranking")}
        />
        <Label
          onMouseOver={() => {
            if (available.includes("ranking")) moveBorder(rankingRef.current.getBoundingClientRect())
          }}
          ref={rankingRef}
          selected={selected.includes("ranking")}
          htmlFor="ranking"
          disabled={!available.includes("ranking")}
        >
          <RankingChartIcon color={theme.colors.darkBlue} />
        </Label>
      </Icons>
    </Container>
  )
}

const Icons = styled.div`
  ${space};
  position: relative;
  box-sizing: border-box;
  min-width: 12rem;
  justify-content: space-around;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background: #ffffff;
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  border-radius: 1px;
  transition: all 0.1s ease-in;
  border: 1px solid #e7eaf4;
  &:hover {
    box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.1);
  }
`
const MovingBorder = styled.div`
  position: absolute;
  pointer-events: none;
  border: 1px solid ${(p) => p.theme.colors.darkBlue};
  border-radius: 2px;
  height: 100%;
  width: calc(100% / 5);
  will-change: width left;
  transition: 0.3s ease-in-out;
`
const Container = styled.div`
  ${space};
`

const HiddenInput = styled.input`
  display: none;
`
type LabelProps = {
  disabled: boolean
  selected: boolean
}

const Label = styled.label<LabelProps>`
  flex: 1;
  padding: 8px;
  display: flex;
  justify-content: center;
  height: 2.5rem;
  width: 2.5rem;
  opacity: ${(props: LabelProps) => (props.disabled ? 0.2 : 1)};
  cursor: ${(props: LabelProps) => (props.disabled ? "not-allowed" : "pointer")};
`

const LineChartIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="100%">
    <title>Line Chart Icon</title>
    <g id="ico_line_chart" data-name="ico line chart">
      <polygon fill={color} points="1 15 1 0 0 0 0 15 0 16 1 16 16 16 16 15 1 15" />
      <path
        fill={color}
        d="M6,9.61l3.79,1.87a1.8,1.8,0,0,0,1.7-.07L16,8.73V7l-5.29,3.13a.29.29,0,0,1-.27,0L6.65,8.26a1.8,1.8,0,0,0-1.74.09L0,11.42v1.77L5.7,9.62A.28.28,0,0,1,6,9.61Z"
      />
      <path
        fill={color}
        d="M6.24,5.52,9.66,6.94a1.8,1.8,0,0,0,1.86-.28L16,2.92V1L10.56,5.51a.32.32,0,0,1-.33,0L6.81,4.14A1.89,1.89,0,0,0,5,4.38L0,8.15V10L5.86,5.57A.39.39,0,0,1,6.24,5.52Z"
      />
      <rect fill="none" width="16" height="16" />
    </g>
  </svg>
)
const StackedChartIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="100%">
    <title>Stacked Chart Icon</title>
    <g id="ico_Stacked_chart" data-name="ico Stacked chart">
      <path
        fill={color}
        d="M9.87,11.93,6.15,10a.55.55,0,0,0-.53,0L0,13.44V16H16V9.16l-4.7,2.73A1.48,1.48,0,0,1,9.87,11.93Z"
      />
      <path
        fill={color}
        d="M10.74,6.5a.49.49,0,0,1-.53.08L6.62,5a1.52,1.52,0,0,0-1.55.2L0,9.19v3.08L5.1,9.15A1.53,1.53,0,0,1,6.61,9.1L10.33,11a.49.49,0,0,0,.47,0L16,8V2Z"
      />
      <polygon fill={color} points="1 15 1 0 0 0 0 15 0 16 1 16 16 16 16 15 1 15" />
      <rect fill="none" width="16" height="16" />
    </g>
  </svg>
)

const PieChartIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="100%">
    <title>Pie Chart Icon</title>
    <g id="ico_Share_by" data-name="ico Share by">
      <path
        fill={color}
        d="M16,6.67A8.88,8.88,0,0,0,9.33,0a.62.62,0,0,0-.76.62V6.16A1.27,1.27,0,0,0,9.84,7.43h5.52A.62.62,0,0,0,16,6.67Z"
      />
      <path
        fill={color}
        d="M5.36,2.3a6.94,6.94,0,1,0,8.34,8.34.49.49,0,0,0-.49-.59H7.94a2,2,0,0,1-2-2V2.79A.49.49,0,0,0,5.36,2.3Z"
      />
      <rect fill="none" width="16" height="16" />
    </g>
  </svg>
)

const RankingChartIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="100%">
    <title>Ranking Chart</title>
    <g id="ico_Top" data-name="ico Top">
      <rect fill={color} y="8" width="4" height="8" rx="0.67" />
      <rect fill={color} x="6" width="4" height="16" rx="0.67" />
      <rect fill={color} x="12" y="4" width="4" height="12" rx="0.67" />
      <rect fill="none" width="16" height="16" />
    </g>
  </svg>
)

const StackedPercentChartIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="100%">
    <title>Stacked Percent Chart Icon</title>
    <polygon fill={color} points="1 15 1 0 0 0 0 15 0 16 1 16 16 16 16 15 1 15" />
    <path
      fill={color}
      d="M5.86,6.94a2.3,2.3,0,1,1,0-4.6,2.3,2.3,0,1,1,0,4.6Zm5.53-4.42h1.85l-7.3,9.64H4.1ZM5.86,5.57a.89.89,0,0,0,.9-.93A.9.9,0,1,0,5,4.64.88.88,0,0,0,5.86,5.57Zm5.6,6.8a2.3,2.3,0,1,1,2.34-2.3A2.29,2.29,0,0,1,11.46,12.37Zm0-1.38a.93.93,0,1,0-.89-.92A.89.89,0,0,0,11.46,11Z"
    />
    <rect width="16" height="16" fill="none" />
  </svg>
)
export default ChartTypesSelect
