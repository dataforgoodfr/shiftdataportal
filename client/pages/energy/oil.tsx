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
  TypesInput,
  DimensionsSelect,
  RadioSelect,
  CTA,
  CategoryName,
  MainChartTitle,
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components"

import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  EnergyUnit,
  GetOilDimensionQuery,
  GetOilDimensionQueryVariables,
  OilDimensions,
  OilInputsQuery,
  OilInputsQueryVariables,
} from "../../types"
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"

const Oil: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedEnergyUnit,
      selectedGdpUnit,
      selectedYearRange,
      selectedSectors,
      selectedOldUrr,
      selectedOldScenari,
      selectedOldCurves,
      selectedReserve,
      selectedScenari,
      selectedCurves,
      selectedType,
      selectedImportExportTypes,
      displayedUnit,
      isRange,
      chartTypes,
      isSelectEnergyFamilyDisabled,
      showUnitSelect,
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
  } = useQuery<OilInputsQuery, OilInputsQueryVariables>(INPUTS, {
    variables: {
      countriesOnly: selectedDimension === "importExport",
    },
  })

  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}))
  const [highchartsSeriesAndCategories, setHighchartsSeriesAndCategories] = useState({ series: [], categories: [] })
  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300)

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "disable-en": isSelectEnergyFamilyDisabled,
      "show-unit": showUnitSelect,
      "energy-unit": selectedEnergyUnit,
      "gdp-unit": selectedGdpUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      sectors: selectedSectors,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
      "old-urr": selectedOldUrr,
      "old-curves": selectedOldCurves,
      "old-scenari": selectedOldScenari,
      reserve: selectedReserve,
      curves: selectedCurves,
      scenari: selectedScenari,
      type: selectedType,
      "import-types": selectedImportExportTypes,
      unit: displayedUnit,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyUnit,
    selectedGdpUnit,
    selectedGroupNames,
    selectedSectors,
    selectedOldUrr,
    selectedType,
    showUnitSelect,
    debouncedYearRange,
    isRange,
    isSelectEnergyFamilyDisabled,
    isGroupNamesMulti,
    selectedOldCurves,
    selectedOldScenari,
    selectedImportExportTypes,
    displayedUnit,
    selectedReserve,
    selectedCurves,
    selectedScenari,
  ])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useState<string>("")
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetOilDimensionQuery,
    GetOilDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      energyUnit: selectedEnergyUnit,
      gdpUnit: selectedGdpUnit,
      bySector: selectedDimension === "bySector",
      perCapita: selectedDimension === "perCapita",
      oldExtrapolation: selectedDimension === "oldExtrapolation",
      extrapolation: selectedDimension === "extrapolation",
      perGDP: selectedDimension === "perGDP",
      total: selectedDimension === "total",
      importExport: selectedDimension === "importExport",
      type: selectedType,
      importExportsTypes: selectedImportExportTypes,
      groupName: selectedGroupNames[0],
      sectors: selectedSectors,
      yearStart: 0,
      yearEnd: 3000,
      oldUrr: selectedOldUrr,
      oldScenari: selectedOldScenari,
      oldCurves: selectedOldCurves,
      reserve: selectedReserve,
      scenari: selectedScenari,
      curves: selectedCurves,
    },
  })
  useEffect(() => {
    if (dimensionData?.oil && dimensionData.oil[selectedDimension]) {
      setHighchartsSeriesAndCategories(
        dimensionData.oil[selectedDimension] as StackedChartProps["highchartsSeriesAndCategories"]
      )
    } else if (dimensionData?.energyIntensityGDP?.total) {
      setHighchartsSeriesAndCategories(dimensionData.energyIntensityGDP.total)
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
    setGraphTitle(`Oil ${selectedType}${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedType, selectedYearRange, selectedDimension, isRange])

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
  } else if (
    loadingInputs ||
    !dataInputs ||
    !dataInputs.oil ||
    !dataInputs.energyIntensityGDP ||
    !dataInputs.primaryEnergies ||
    !dataInputs.importExport
  ) {
    inputs = <p>Loading...</p>
  } else {
    const {
      energyUnits,
      zones,
      groups,
      countries,
      // This Production or Consumption not the chartType
      dimensions,
      sectors,
      oldScenari,
      oldUrrs,
      oldCurves,
      multiSelects,
      reserves,
      curves,
      scenari,
    } = dataInputs.oil
    const { gdpUnits } = dataInputs.energyIntensityGDP
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
          {selectedDimension !== "oldExtrapolation" && selectedDimension !== "extrapolation" && (
            <GroupNamesSelect
              isLoading={loadingInputs}
              isMulti={isGroupNamesMulti}
              multiSelect={[
                ...(dimensionData?.oil?.perCapita?.multiSelects && selectedDimension === "perCapita"
                  ? dimensionData.oil.perCapita.multiSelects
                  : []),
                ...(dimensionData?.oil?.total?.multiSelects && selectedDimension === "total"
                  ? dimensionData.oil.total.multiSelects
                  : []),
                ...(dimensionData?.importExport?.total?.multiSelects && selectedDimension === "importExport"
                  ? dimensionData?.importExport?.total?.multiSelects
                  : []),
                ...(dimensionData?.oil?.provenReserve?.multiSelects && selectedDimension === "provenReserve"
                  ? dimensionData.oil.provenReserve.multiSelects
                  : []),
                ...(multiSelects ? multiSelects : []),
              ]}
              zones={zones ? zones : []}
              groups={groups ? groups : []}
              countries={countries}
              value={selectedGroupNames}
              setSelectedGroupNames={(selectedGroupNames) => {
                dispatch({
                  type: "selectGroupNames",
                  payload: { selectedGroupNames },
                })
              }}
            />
          )}
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
          {showUnitSelect && (
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
          {selectedDimension === "perGDP" && (
            <RadioSelect
              label="GDP Unit"
              inputName="GDP Unit"
              selectedOption={selectedGdpUnit}
              options={gdpUnits}
              onChange={(selectedGdpUnit) => {
                dispatch({
                  type: "selectGdpUnit",
                  payload: { selectedGdpUnit },
                })
              }}
            />
          )}
          {selectedDimension !== "provenReserve" &&
            selectedDimension !== "importExport" &&
            selectedDimension !== "oldExtrapolation" &&
            selectedDimension !== "extrapolation" && (
              <RadioSelect
                label="Type"
                inputName="Type"
                selectedOption={selectedType}
                options={selectedDimension === "perGDP" ? ["Consumption"] : types}
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
          {selectedDimension === "extrapolation" && (
            <Fragment>
              <RadioSelect
                label="Reserve"
                inputName="Reserve"
                selectedOption={selectedReserve}
                options={reserves}
                onChange={(selectedReserve) => {
                  dispatch({
                    type: "selectReserve",
                    payload: { selectedReserve },
                  })
                }}
              />
              <TypesInput
                typeName="Scenarios"
                label="Scenarios"
                isLoading={loadingInputs}
                types={scenari}
                selectedTypes={selectedScenari}
                setSelectedTypes={(selectedScenari) => {
                  dispatch({
                    type: "selectScenari",
                    payload: { selectedScenari },
                  })
                }}
              />
              <TypesInput
                typeName="Extrapolation Curves"
                label="Extrapolation Curves"
                isLoading={loadingInputs}
                types={curves.map((curve) => ({ name: curve, color: "#000" }))}
                selectedTypes={selectedCurves}
                setSelectedTypes={(selectedCurves) => {
                  dispatch({
                    type: "selectCurves",
                    payload: { selectedCurves },
                  })
                }}
              />
            </Fragment>
          )}
          {selectedDimension === "oldExtrapolation" && (
            <Fragment>
              <RadioSelect
                label="URR"
                inputName="URR"
                selectedOption={selectedOldUrr}
                options={oldUrrs}
                onChange={(selectedOldUrr) => {
                  dispatch({
                    type: "selectOldUrr",
                    payload: { selectedOldUrr },
                  })
                }}
              />
              <TypesInput
                typeName="Scenarios"
                label="Scenarios"
                isLoading={loadingInputs}
                types={oldScenari}
                selectedTypes={selectedOldScenari}
                setSelectedTypes={(selectedOldScenari) => {
                  dispatch({
                    type: "selectOldScenari",
                    payload: { selectedOldScenari },
                  })
                }}
              />
              <TypesInput
                typeName="Extrapolation Curves"
                label="Extrapolation Curves"
                isLoading={loadingInputs}
                types={oldCurves.map((curve) => ({ name: curve, color: "#000" }))}
                selectedTypes={selectedOldCurves}
                setSelectedTypes={(selectedOldCurves) => {
                  dispatch({
                    type: "selectOldCurves",
                    payload: { selectedOldCurves },
                  })
                }}
              />
            </Fragment>
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
        unit={displayedUnit}
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
        <MainChartTitle>Oil</MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={displayedUnit}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            highchartsSeriesAndCategories={highchartsSeriesAndCategories}
            title={graphTitle}
          />
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.oil?.mdInfos && <GraphInfos>{dataInputs.oil.mdInfos}</GraphInfos>}
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
Oil.getInitialProps = async function ({ query }) {
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
      selectedDimension: (query["dimension"] as OilDimensions)
        ? (query["dimension"] as OilDimensions)
        : OilDimensions.PerCapita,
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
      selectedScenari: (query["scenari"] as string[] | string)
        ? Array.isArray(query["scenari"] as string[] | string)
          ? (query["scenari"] as string[])
          : [query["scenari"] as string]
        : ["Current Policies", "Stated Policies", "Sustainable Development"],
      selectedOldScenari: (query["old-scenari"] as string[] | string)
        ? Array.isArray(query["old-scenari"] as string[] | string)
          ? (query["old-scenari"] as string[])
          : [query["old-scenari"] as string]
        : [
            "EIA - High Oil Price",
            "OPEC - Reference Case",
            "IEA - Current Policies Scenario",
            "History - Extension of Historical Data",
            "EIA - Traditional Low Oil Price",
            "IEA - New Policies Scenario",
            "Univ. Of Uppsala - World Oil Outlook 2008",
            "EIA - Low Oil Price",
            "IEA - 450 Scenario",
            "Historical - Data",
            "EIA - Traditional High Oil Price",
            "EIA - Reference",
          ],
      selectedCurves: (query["curves"] as string[] | string)
        ? Array.isArray(query["curves"] as string[] | string)
          ? (query["curves"] as string[])
          : [query["curves"] as string]
        : ["Hubbert"],
      selectedOldCurves: (query["old-curves"] as string[] | string)
        ? Array.isArray(query["old-curves"] as string[] | string)
          ? (query["old-curves"] as string[])
          : [query["old-curves"] as string]
        : ["Hubbert"],
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.Toe,
      selectedReserve: (query["reserve"] as string) ? (query["reserve"] as string) : "775 (Laherrère 2020)",
      selectedOldUrr: (query["old-urr"] as string) ? (query["old-urr"] as string) : "4100",
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
      showUnitSelect: (query["show-unit"] as string) ? JSON.parse(query["show-unit"] as string) : true,
      selectedGdpUnit: (query["gdp-unit"] as string) ? (query["gdp-unit"] as string) : "GDP (constant 2010 US$)",
      selectedType: (query["type"] as string) ? (query["type"] as string) : "Consumption",
      displayedUnit: (query["unit"] as EnergyUnit) ? (query["unit"] as EnergyUnit) : EnergyUnit.Toe,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query oilInputs($countriesOnly: Boolean!) {
    energyIntensityGDP {
      gdpUnits
    }
    primaryEnergies {
      types
    }
    importExport {
      importExportTypes: types
    }
    oil {
      mdInfos
      energyUnits
      groups @skip(if: $countriesOnly) {
        name
        color
      }
      zones @skip(if: $countriesOnly) {
        name
        color
      }
      multiSelects(countriesOnly: $countriesOnly) {
        name
        data {
          name
          color
        }
      }
      countries {
        name
        color
      }
      sectors {
        name
        color
      }
      dimensions
      scenari {
        name
        color
      }
      reserves
      curves
      oldScenari {
        name
        color
      }
      oldUrrs
      oldCurves
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getOilDimension(
    $sectors: [String!]!
    $groupNames: [String]!
    $groupName: String
    $energyUnit: EnergyUnit!
    $perCapita: Boolean!
    $perGDP: Boolean!
    $importExport: Boolean!
    $yearStart: Int!
    $bySector: Boolean!
    $extrapolation: Boolean!
    $reserve: String!
    $curves: [String]!
    $scenari: [String]!
    $oldExtrapolation: Boolean!
    $oldUrr: String!
    $oldCurves: [String]!
    $oldScenari: [String]!
    $yearEnd: Int!
    $type: String!
    $total: Boolean!
    $gdpUnit: String!
    $importExportsTypes: [String]!
  ) {
    energyIntensityGDP {
      total(
        groupNames: $groupNames
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        gdpUnit: $gdpUnit
        energyType: "Total Primary Oil Consumption"
      ) @include(if: $perGDP) {
        categories
        series {
          name
          data
          color
        }
      }
    }
    importExport {
      total(
        groupNames: $groupNames
        types: $importExportsTypes
        energyFamily: "Oil"
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
    oil {
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
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
      perCapita(
        groupNames: $groupNames
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        type: $type
      ) @include(if: $perCapita) {
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
      extrapolation(yearStart: $yearStart, yearEnd: $yearEnd, scenari: $scenari, reserve: $reserve, curves: $curves)
        @include(if: $extrapolation) {
        categories
        series {
          name
          data
          color
          dashStyle
        }
      }
      oldExtrapolation(
        yearStart: $yearStart
        yearEnd: $yearEnd
        scenari: $oldScenari
        urr: $oldUrr
        curves: $oldCurves
      ) @include(if: $oldExtrapolation) {
        categories
        series {
          name
          data
          color
          dashStyle
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
  selectedDimension: OilDimensions
  selectedEnergyUnit: GetOilDimensionQueryVariables["energyUnit"]
  selectedGdpUnit: GetOilDimensionQueryVariables["gdpUnit"]
  selectedGroupNames: GetOilDimensionQueryVariables["groupNames"]
  selectedSectors: GetOilDimensionQueryVariables["sectors"]
  selectedReserve: GetOilDimensionQueryVariables["reserve"]
  selectedCurves: GetOilDimensionQueryVariables["curves"]
  selectedScenari: GetOilDimensionQueryVariables["scenari"]
  selectedOldUrr: GetOilDimensionQueryVariables["oldUrr"]
  selectedOldCurves: GetOilDimensionQueryVariables["oldCurves"]
  selectedOldScenari: GetOilDimensionQueryVariables["oldScenari"]
  selectedType: GetOilDimensionQueryVariables["type"]
  displayedUnit: StackedChartProps["unit"]
  selectedImportExportTypes: GetOilDimensionQueryVariables["importExportsTypes"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  showUnitSelect: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | OilDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectGdpUnit"
  | "selectEnergyFamilies"
  | "selectSectors"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectReserve"
  | "selectScenari"
  | "selectCurves"
  | "selectOldUrr"
  | "selectOldScenari"
  | "selectOldCurves"
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
      selectedReserve?: ReducerState["selectedReserve"]
      selectedScenari?: ReducerState["selectedScenari"]
      selectedCurves?: ReducerState["selectedCurves"]
      selectedOldUrr?: ReducerState["selectedOldUrr"]
      selectedOldScenari?: ReducerState["selectedOldScenari"]
      selectedOldCurves?: ReducerState["selectedOldCurves"]
      selectedGdpUnit?: ReducerState["selectedGdpUnit"]
      selectedType?: ReducerState["selectedType"]
      selectedImportExportTypes?: ReducerState["selectedImportExportTypes"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case OilDimensions.BySector:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: OilDimensions.BySector,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        showUnitSelect: true,
        displayedUnit: EnergyUnit.Mtoe,
      }
    case OilDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: OilDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Toe,
        isRange: true,
        showUnitSelect: true,
        displayedUnit: EnergyUnit.Toe,
      }
    case OilDimensions.ProvenReserve:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: OilDimensions.ProvenReserve,
        isGroupNamesMulti: true,
        isRange: true,
        showUnitSelect: false,
        displayedUnit: "Gb",
      }
    case OilDimensions.Extrapolation:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line"],
        selectedDimension: OilDimensions.Extrapolation,
        isGroupNamesMulti: false,
        isRange: true,
        showUnitSelect: false,
        displayedUnit: "Mb/d",
      }
    case OilDimensions.OldExtrapolation:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line"],
        selectedDimension: OilDimensions.OldExtrapolation,
        isGroupNamesMulti: false,
        isRange: true,
        showUnitSelect: false,
        displayedUnit: "Mb/d",
      }
    case OilDimensions.PerGdp:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line"],
        selectedDimension: OilDimensions.PerGdp,
        type: "Consumption",
        isGroupNamesMulti: true,
        isRange: true,
        showUnitSelect: true,
        displayedUnit: EnergyUnit.Toe,
      }
    case OilDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: OilDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        showUnitSelect: true,
        isRange: true,
        displayedUnit: EnergyUnit.Mtoe,
      }
    case OilDimensions.ImportExport:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: OilDimensions.ImportExport,
        isGroupNamesMulti: true,
        showUnitSelect: false,
        isRange: true,
        displayedUnit: "Mb/d",
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
        displayedUnit: action.payload.selectedEnergyUnit,
      }
    case "selectGdpUnit":
      return {
        ...prevState,
        selectedGdpUnit: action.payload.selectedGdpUnit,
      }
    case "selectType":
      return {
        ...prevState,
        selectedType: action.payload.selectedType,
      }
    case "selectImportExportTypes":
      return {
        ...prevState,
        selectedImportExportTypes: action.payload.selectedImportExportTypes,
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
    case "selectReserve":
      return {
        ...prevState,
        selectedReserve: action.payload.selectedReserve,
      }
    case "selectScenari":
      return {
        ...prevState,
        selectedScenari: action.payload.selectedScenari,
      }
    case "selectCurves":
      return {
        ...prevState,
        selectedCurves: action.payload.selectedCurves,
      }
    case "selectOldUrr":
      return {
        ...prevState,
        selectedOldUrr: action.payload.selectedOldUrr,
      }
    case "selectOldScenari":
      return {
        ...prevState,
        selectedOldScenari: action.payload.selectedOldScenari,
      }
    case "selectOldCurves":
      return {
        ...prevState,
        selectedOldCurves: action.payload.selectedOldCurves,
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

export default Oil
