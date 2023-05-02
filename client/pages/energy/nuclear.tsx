import { useQuery } from "@apollo/client"
import gql from "graphql-tag"
import { NextPage } from "next"
import Head from "next/head"
import { ParsedUrlQueryInput } from "querystring"
import React, { Fragment, useEffect, useReducer, useState, useRef } from "react"
import { Range } from "react-input-range"
import { useDebounce } from "use-debounce"
import {
  ChartTypesSelect,
  Footer,
  GroupNamesSelect,
  Nav,
  Main,
  Share,
  RadioSelect,
  CTA,
  CategoryName,
  MainChartTitle,
  DimensionsSelect,
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components"
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  EnergyUnit,
  GetNuclearDimensionQuery,
  GetNuclearDimensionQueryVariables,
  NuclearDimensions,
  NuclearInputsQuery,
  NuclearInputsQueryVariables,
} from "../../types"
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"

const Nuclear: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedEnergyUnit,
      selectedYearRange,
      isRange,
      chartTypes,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params })
  // Query all the inputs options, automatically re-fetches when a variable changes
  const {
    loading: loadingInputs,
    data: dataInputs,
    error: errorInputs,
  } = useQuery<NuclearInputsQuery, NuclearInputsQueryVariables>(INPUTS)
  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}))

  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300)

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "energy-unit": selectedEnergyUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyUnit,
    selectedGroupNames,
    debouncedYearRange,
    isRange,
    isGroupNamesMulti,
  ])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useState<string>("")
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetNuclearDimensionQuery,
    GetNuclearDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      energyUnit: selectedEnergyUnit === "%" ? EnergyUnit.Mtoe : selectedEnergyUnit,
      total: selectedDimension === "total",
      shareOfElectricityGeneration: selectedDimension === "shareOfElectricityGeneration",
      dimension: selectedDimension,
      groupNames: selectedGroupNames,
      yearStart: 0,
      yearEnd: 3000,
    },
  })

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    setGraphTitle(`Nuclear ${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedYearRange, selectedDimension, isRange])
  function handleCsvDownloadClick() {
    stackedChartRef.current.downloadCSV()
  }
  function handleScreenshotDownloadClick() {
    stackedChartRef.current.exportChart()
  }
  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.nuclear) {
    inputs = <p>Loading...</p>
  } else {
    const { energyUnits, zones, groups, countries, dimensions } = dataInputs.nuclear
    inputs = (
      <Fragment>
        <div>
          {
            <DimensionsSelect
              dimensions={dimensions}
              onChange={(newDimension) =>
                dispatch({
                  type: newDimension as ReducerActions,
                })
              }
              selectedDimension={selectedDimension}
            />
          }
        </div>
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            zones={zones}
            multiSelect={[
              ...(dimensionData?.nuclear?.total?.multiSelects && selectedDimension === "total"
                ? dimensionData.nuclear.total.multiSelects
                : []),
              ...(dimensionData?.nuclear?.shareOfElectricityGeneration?.multiSelects &&
              selectedDimension === "shareOfElectricityGeneration"
                ? dimensionData.nuclear.shareOfElectricityGeneration.multiSelects
                : []),
              ...(dimensionData?.nuclear?.multiSelects ? dimensionData.nuclear.multiSelects : []),
            ]}
            groups={groups}
            countries={countries}
            value={selectedGroupNames}
            setSelectedGroupNames={(selectedGroupNames) => {
              dispatch({
                type: "selectGroupNames",
                payload: { selectedGroupNames },
              })
            }}
          />
          {selectedDimension !== "shareOfElectricityGeneration" && (
            <RadioSelect
              label="Unit"
              inputName="Unit"
              selectedOption={selectedEnergyUnit}
              options={Object.keys(energyUnits)}
              onChange={(selectedEnergyUnit) => {
                dispatch({
                  type: "selectEnergyUnit",
                  payload: { selectedEnergyUnit },
                })
              }}
            />
          )}
          <ChartTypesSelect
            aria-label="chartTypes"
            selected={selectedChartType}
            available={chartTypes}
            onChange={(value: ChartType) => {
              switch (value) {
                case "pie":
                  dispatch({
                    type: "selectPie",
                  })
                  break
                case "line":
                  dispatch({ type: "selectLine" })
                  break
                case "stacked":
                  dispatch({ type: "selectStacked" })
                  break
                case "ranking":
                  dispatch({ type: "selectRanking" })
                  break
                case "stacked-percent":
                  dispatch({ type: "selectStackedPercent" })
                  break
                default:
                  console.warn(`ChartTypes input "${value}" didn't match any chartTypes`)
              }
            }}
          />
        </SelectContainer>
      </Fragment>
    )
  }
  if (iframe) {
    return (
      <StackedChart
        iframe={iframe}
        chartHeight={chartHeight}
        onYearRangeChange={onYearRangeChange}
        isRange={isRange}
        ref={stackedChartRef}
        unit={selectedEnergyUnit}
        isLoading={dimensionLoading}
        type={selectedChartType}
        yearRange={selectedYearRange}
        title={graphTitle}
        highchartsSeriesAndCategories={
          dimensionData?.nuclear && dimensionData.nuclear[selectedDimension]
            ? (dimensionData.nuclear[
                selectedDimension
              ] as unknown as StackedChartProps["highchartsSeriesAndCategories"])
            : { series: [], categories: [] }
        }
      />
    )
  }
  return (
    <Fragment>
      <Head>
        <title>The Shift Project - {graphTitle}</title>
      </Head>
      <Nav />
      <Main>
        <CategoryName type="ENERGY" />
        <MainChartTitle>Nuclear</MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={selectedEnergyUnit}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            title={graphTitle}
            highchartsSeriesAndCategories={
              dimensionData?.nuclear && dimensionData.nuclear[selectedDimension]
                ? (dimensionData.nuclear[
                    selectedDimension
                  ] as unknown as StackedChartProps["highchartsSeriesAndCategories"])
                : { series: [], categories: [] }
            }
          />
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.nuclear?.mdInfos && <GraphInfos>{dataInputs.nuclear.mdInfos}</GraphInfos>}
        <SharingButtons title={graphTitle} />
        <CTA>
          <CTA.Climate />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  )
}
Nuclear.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedDimension: (query["dimension"] as NuclearDimensions)
        ? (query["dimension"] as NuclearDimensions)
        : NuclearDimensions.Total,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "line",
      chartTypes: (query["chart-types"] as ChartType[] | ChartType)
        ? Array.isArray(query["chart-types"] as ChartType[] | ChartType)
          ? (query["chart-types"] as ChartType[])
          : [query["chart-types"] as ChartType]
        : (["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[]),
      selectedGroupNames: (query["group-names"] as string[] | string)
        ? Array.isArray(query["group-names"] as string[] | string)
          ? (query["group-names"] as string[])
          : [query["group-names"] as string]
        : ["World"],
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.TWh,
      // Group name multi only when dimension is "byEnergyFamily"
      isGroupNamesMulti: (query["multi"] as String) === undefined ? true : query["multi"] === "true" ? true : false,
      selectedYearRange:
        query["start"] && query["end"]
          ? {
              min: parseInt(query["start"] as string),
              max: parseInt(query["end"] as string),
            }
          : { min: null, max: null },
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query nuclearInputs {
    nuclear {
      mdInfos
      dimensions
      energyUnits
      groups {
        name
        color
      }
      zones {
        name
        color
      }
      countries {
        name
        color
      }
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getNuclearDimension(
    $groupNames: [String]!
    $energyUnit: EnergyUnit!
    $yearStart: Int!
    $yearEnd: Int!
    $total: Boolean!
    $shareOfElectricityGeneration: Boolean!
    $dimension: NuclearDimensions!
  ) {
    nuclear {
      multiSelects(dimension: $dimension) {
        name
        data {
          name
          color
        }
      }
      shareOfElectricityGeneration(groupNames: $groupNames, yearStart: $yearStart, yearEnd: $yearEnd)
        @include(if: $shareOfElectricityGeneration) {
        categories
        series {
          name
          data
          color
        }
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
      total(groupNames: $groupNames, energyUnit: $energyUnit, yearStart: $yearStart, yearEnd: $yearEnd)
        @include(if: $total) {
        categories
        series {
          name
          data
          color
        }
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
    }
  }
`
interface DefaultProps {
  params: ReducerState
}
interface ReducerState {
  chartTypes: ChartType[]
  selectedChartType: ChartType
  isGroupNamesMulti: boolean
  selectedDimension: NuclearDimensions
  selectedEnergyUnit: GetNuclearDimensionQueryVariables["energyUnit"] | "%"
  selectedGroupNames: GetNuclearDimensionQueryVariables["groupNames"]
  iframe: boolean
  isRange: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | NuclearDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectYears"
  | "selectType"
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"]
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedYearRange?: ReducerState["selectedYearRange"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case NuclearDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: NuclearDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.TWh,
      }
    case NuclearDimensions.ShareOfElectricityGeneration:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: NuclearDimensions.ShareOfElectricityGeneration,
        isGroupNamesMulti: true,
        selectedEnergyUnit: "%",
      }
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      }
    case "selectEnergyUnit":
      return {
        ...prevState,
        selectedEnergyUnit: action.payload.selectedEnergyUnit,
      }
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      }
    case "selectStacked":
      return {
        ...prevState,
        selectedChartType: "stacked",
        isRange: true,
      }
    case "selectStackedPercent":
      return {
        ...prevState,
        selectedChartType: "stacked-percent",
        isRange: true,
      }
    case "selectLine":
      return {
        ...prevState,
        selectedChartType: "line",
        isRange: true,
      }
    case "selectRanking":
      return {
        ...prevState,
        selectedChartType: "ranking",
        isRange: false,
      }
    case "selectYears":
      return {
        ...prevState,
        selectedYearRange: action.payload.selectedYearRange,
      }
    default:
      console.warn(`Reducer didn't match any action of type ${action.type}`)
      return prevState
  }
}

export default Nuclear
