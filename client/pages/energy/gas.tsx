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
  TypesInput,
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
  GetGasDimensionQuery,
  GetGasDimensionQueryVariables,
  GasDimensions,
  GasInputsQuery,
  GasInputsQueryVariables,
} from "../../types"

import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"
import { ShareChart } from "../../components/Share"

const Gas: NextPage<DefaultProps> = ({ params }) => {
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
      selectedSectors,
      selectedType,
      isRange,
      chartTypes,
      isSelectEnergyFamilyDisabled,
      selectedImportExportTypes,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params })
  debugger
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    GasInputsQuery,
    GasInputsQueryVariables
  >(INPUTS, {
    variables: {
      countriesOnly: selectedDimension === "importExport",
    },
  })
  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}))
  // The data used in the graph
  const [highchartsSeriesAndCategories, setHighchartsSeriesAndCategories] = useState({ series: [], categories: [] })
  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300)

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "disable-en": isSelectEnergyFamilyDisabled,
      "energy-unit": selectedEnergyUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      sectors: selectedSectors,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
      type: selectedType,
      "import-types": selectedImportExportTypes,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyUnit,
    selectedGroupNames,
    selectedSectors,
    debouncedYearRange,
    isRange,
    isSelectEnergyFamilyDisabled,
    isGroupNamesMulti,
    selectedType,
    selectedImportExportTypes,
  ])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useState<string>("")
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetGasDimensionQuery,
    GetGasDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      energyUnit: selectedEnergyUnit,
      bySector: selectedDimension === "bySector",
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      importExport: selectedDimension === "importExport",
      importExportsTypes: selectedImportExportTypes,
      type: selectedType,
      groupName: selectedGroupNames[0],
      groupNames: selectedGroupNames,
      sectors: selectedSectors,
      yearStart: 0,
      yearEnd: 3000,
    },
  })
  useEffect(() => {
    if (dimensionData?.gas && dimensionData.gas[selectedDimension]) {
      setHighchartsSeriesAndCategories(
        (dimensionData.gas[selectedDimension] as unknown) as StackedChartProps["highchartsSeriesAndCategories"]
      )
    } else if (dimensionData?.importExport?.total) {
      setHighchartsSeriesAndCategories(dimensionData.importExport.total)
    } else {
      setHighchartsSeriesAndCategories({ series: [], categories: [] })
    }
  }, [dimensionData, selectedDimension])

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    setGraphTitle(`Gas ${selectedType}${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedType, selectedYearRange, selectedDimension, isRange])

  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (
    loadingInputs ||
    !dataInputs ||
    !dataInputs.gas ||
    !dataInputs.primaryEnergies ||
    !dataInputs.importExport
  ) {
    inputs = <p>Loading...</p>
  } else {
    const { energyUnits, zones, groups, countries, sectors, dimensions } = dataInputs.gas
    const { types } = dataInputs.primaryEnergies
    const { importExportTypes } = dataInputs.importExport
    inputs = (
      <Fragment>
        <div>
          {
            <DimensionsSelect
              // @TODO = when IEA problems will be cleared delete this
              dimensions={dimensions.filter((dimension) => dimension !== "bySector")}
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
            zones={zones ? zones : []}
            groups={groups ? groups : []}
            multiSelect={[
              ...(dimensionData?.gas?.provenReserve?.multiSelects && selectedDimension === "provenReserve"
                ? dimensionData.gas.provenReserve.multiSelects
                : []),
              ...(dimensionData?.gas?.total?.multiSelects && selectedDimension === "total"
                ? dimensionData.gas.total.multiSelects
                : []),
              ...(dimensionData?.importExport?.total?.multiSelects && selectedDimension === "importExport"
                ? dimensionData?.importExport?.total?.multiSelects
                : []),
              ...(dimensionData?.gas?.multiSelects ? dimensionData.gas.multiSelects : []),
            ]}
            countries={countries}
            value={selectedGroupNames}
            setSelectedGroupNames={(selectedGroupNames) => {
              dispatch({
                type: "selectGroupNames",
                payload: { selectedGroupNames },
              })
            }}
          />
          {selectedDimension === "bySector" && (
            <TypesInput
              label="Sectors"
              typeName="Sectors"
              isLoading={loadingInputs}
              types={sectors}
              selectedTypes={selectedSectors}
              setSelectedTypes={(selectedSectors) => {
                dispatch({
                  type: "selectSectors",
                  payload: { selectedSectors },
                })
              }}
            />
          )}
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
          {selectedDimension === "total" && (
            <RadioSelect
              label="Type"
              inputName="Type"
              selectedOption={selectedType}
              options={types}
              onChange={(selectedType) => {
                dispatch({
                  type: "selectType",
                  payload: { selectedType },
                })
              }}
            />
          )}
          {selectedDimension === "importExport" && (
            <TypesInput
              typeName="Import/Export"
              label="Import/Export"
              isLoading={loadingInputs}
              types={importExportTypes.map((type) => ({ name: type, color: "#000000" }))}
              selectedTypes={selectedImportExportTypes}
              setSelectedTypes={(selectedImportExportTypes) => {
                dispatch({
                  type: "selectImportExportTypes",
                  payload: { selectedImportExportTypes },
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
                    payload: {
                      selectedSectors: sectors.map((item) => item.name),
                    },
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
        highchartsSeriesAndCategories={highchartsSeriesAndCategories}
        title={graphTitle}
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
        <MainChartTitle>Gas</MainChartTitle>
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
            highchartsSeriesAndCategories={highchartsSeriesAndCategories}
            title={graphTitle}
          />
        </div>
        <ShareChart chartRef={stackedChartRef}></ShareChart>
        {dataInputs?.gas?.mdInfos && <GraphInfos>{dataInputs.gas.mdInfos}</GraphInfos>}
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
Gas.getInitialProps = async function({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedSectors: query.sectors
        ? Array.isArray(query.sectors)
          ? (query.sectors as string[])
          : [query.sectors as string]
        : ["Transport"],
      selectedDimension: (query["dimension"] as GasDimensions)
        ? (query["dimension"] as GasDimensions)
        : GasDimensions.ProvenReserve,
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
      selectedImportExportTypes: (query["import-types"] as string[] | string)
        ? Array.isArray(query["import-types"] as string[] | string)
          ? (query["import-types"] as string[])
          : [query["import-types"] as string]
        : ["Imports", "Exports", "Net Imports"],
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.Bcm,
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
      isSelectEnergyFamilyDisabled: (query["disable-en"] as string) ? JSON.parse(query["disable-en"] as string) : false,
      selectedType: (query["type"] as string) ? (query["type"] as string) : "Consumption",
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query gasInputs($countriesOnly: Boolean!) {
    primaryEnergies {
      types
    }
    importExport {
      importExportTypes: types
    }
    gas {
      mdInfos
      dimensions
      energyUnits
      groups @skip(if: $countriesOnly) {
        name
        color
      }
      zones @skip(if: $countriesOnly) {
        name
        color
      }
      countries {
        name
        color
      }
      sectors {
        name
        color
      }
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getGasDimension(
    $sectors: [String!]!
    $groupName: String
    $groupNames: [String]!
    $energyUnit: EnergyUnit!
    $yearStart: Int!
    $bySector: Boolean!
    $perCapita: Boolean!
    $total: Boolean!
    $importExport: Boolean!
    $yearEnd: Int!
    $type: String!
    $importExportsTypes: [String]!
  ) {
    importExport {
      total(
        groupNames: $groupNames
        types: $importExportsTypes
        energyFamily: "Gas"
        yearStart: $yearStart
        yearEnd: $yearEnd
      ) @include(if: $importExport) {
        multiSelects {
          name
          data {
            name
            color
          }
        }
        categories
        series {
          name
          data
          dashStyle
          color
        }
      }
    }
    gas {
      multiSelects {
        name
        data {
          name
          color
        }
      }
      perCapita(groupNames: $groupNames, energyUnit: $energyUnit, yearStart: $yearStart, yearEnd: $yearEnd)
        @include(if: $perCapita) {
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
      provenReserve(groupNames: $groupNames, yearStart: $yearStart, yearEnd: $yearEnd) {
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
      bySector(
        sectors: $sectors
        groupName: $groupName
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
      ) @include(if: $bySector) {
        categories
        series {
          name
          data
          color
        }
      }
      total(groupNames: $groupNames, energyUnit: $energyUnit, type: $type, yearStart: $yearStart, yearEnd: $yearEnd)
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
  selectedDimension: GasDimensions
  selectedEnergyUnit: GetGasDimensionQueryVariables["energyUnit"]
  selectedGroupNames: GetGasDimensionQueryVariables["groupName"][]
  selectedSectors: GetGasDimensionQueryVariables["sectors"]
  selectedType: GetGasDimensionQueryVariables["type"]
  selectedImportExportTypes: GetGasDimensionQueryVariables["importExportsTypes"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | GasDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectEnergyFamilies"
  | "selectSectors"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectYears"
  | "selectType"
  | "selectImportExportTypes"
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"]
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedSectors?: ReducerState["selectedSectors"]
      selectedYearRange?: ReducerState["selectedYearRange"]
      selectedType?: ReducerState["selectedType"]
      selectedImportExportTypes?: ReducerState["selectedImportExportTypes"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case GasDimensions.BySector:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: GasDimensions.BySector,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.Mtoe,
      }
    case GasDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: GasDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Mtoe,
      }
    case GasDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: GasDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Toe,
        isRange: true,
        showUnitSelect: true,
      }
    case GasDimensions.ProvenReserve:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: GasDimensions.ProvenReserve,
        isGroupNamesMulti: true,
        isRange: true,
        showUnitSelect: false,
      }
    case GasDimensions.ImportExport:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: GasDimensions.ImportExport,
        isGroupNamesMulti: true,
        showUnitSelect: false,
        isRange: true,
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
    case "selectType":
      return {
        ...prevState,
        selectedType: action.payload.selectedType,
      }
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      }
    case "selectSectors":
      return {
        ...prevState,
        selectedSectors: action.payload.selectedSectors,
      }
    case "selectImportExportTypes":
      return {
        ...prevState,
        selectedImportExportTypes: action.payload.selectedImportExportTypes,
      }
    case "selectPie":
      return {
        ...prevState,
        selectedSectors: action.payload.selectedSectors,
        selectedChartType: "pie",
        isRange: false,
        isSelectEnergyFamilyDisabled: true,
      }
    case "selectStacked":
      return {
        ...prevState,
        selectedChartType: "stacked",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      }
    case "selectStackedPercent":
      return {
        ...prevState,
        selectedChartType: "stacked-percent",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      }
    case "selectLine":
      return {
        ...prevState,
        selectedChartType: "line",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      }
    case "selectRanking":
      return {
        ...prevState,
        selectedChartType: "ranking",
        isSelectEnergyFamilyDisabled: true,
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

export default Gas
