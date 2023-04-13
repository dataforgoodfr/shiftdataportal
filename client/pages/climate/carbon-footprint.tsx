import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { NextPage } from "next";
import Head from "next/head";
import { ParsedUrlQueryInput } from "querystring";
import React, { Fragment, useEffect, useReducer, useState, useRef } from "react";

import { Range } from "react-input-range";
import { useDebounce } from "use-debounce";
import {
  ChartTypesSelect,
  Footer,
  GroupNamesSelect,
  Main,
  Share,
  DimensionsSelect,
  Nav,
  RadioSelect,
  CategoryName,
  MainChartTitle,
  CTA,
  TypesInput,
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components";
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart";
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl";
import {
  Co2Unit,
  GetFootprintDimensionQuery,
  GetFootprintDimensionQueryVariables,
  FootprintDimensions,
  FootprintInputsQuery,
  FootprintInputsQueryVariables,
} from "../../types";
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton";
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange";
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable";

const Footprint: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null);
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      selectedGroupNames,
      selectedCO2Unit,
      selectedYearRange,
      selectedGdpUnit,
      isRange,
      chartTypes,
      selectedScopes,
      iframe,
      chartHeight,
    },
    dispatch,
  ] = useReducer(reducer, { ...params });
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    FootprintInputsQuery,
    FootprintInputsQueryVariables
  >(INPUTS, {
    variables: {
      dimension: selectedDimension,
    },
  });
  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}));

  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300);

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "emissions-unit": selectedCO2Unit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      gdpUnits: selectedGdpUnit,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      scopes: selectedScopes,
    });
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedCO2Unit,
    selectedGroupNames,
    selectedGdpUnit,
    debouncedYearRange,
    isRange,
    selectedScopes,
  ]);
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams);

  const [graphTitle, setGraphTitle] = useState<string>("");
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetFootprintDimensionQuery,
    GetFootprintDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      emissionsUnit: selectedCO2Unit,
      perGDP: selectedDimension === "perGDP",
      dimension: selectedDimension,
      gdpUnit: selectedGdpUnit,
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      scopes: selectedScopes,
      yearStart: 0,
      yearEnd: 3000,
    },
  });

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : "";
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : "";
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max;
    setGraphTitle(`CO2 Footprint${displayedDimension}, ${displayedGroupNames} ${displayedYears}`);
  }, [selectedGroupNames, selectedYearRange, selectedDimension, isRange]);
  function handleCsvDownloadClick() {
    stackedChartRef.current.downloadCSV();
  }
  function handleScreenshotDownloadClick() {
    stackedChartRef.current.exportChart();
  }
  const onYearRangeChange = useOnYearRangeChange(dispatch);
  let inputs: any;

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>;
  } else if (loadingInputs || !dataInputs || !dataInputs.footprint) {
    inputs = <p>Loading...</p>;
  } else {
    const { emissionsUnits, zones, groups, countries, dimensions, gdpUnits, scopes } = dataInputs.footprint;
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
            isMulti={true}
            // multiSelect={dimensionData?.footprint?.multiSelects ? dimensionData.footprint.multiSelects : []}
            multiSelect={[
              ...(dimensionData?.footprint[selectedDimension]?.multiSelects
                ? dimensionData.footprint[selectedDimension].multiSelects
                : []),
              ...(dimensionData?.footprint?.multiSelects ? dimensionData.footprint.multiSelects : []),
            ]}
            zones={zones}
            groups={groups}
            countries={countries}
            value={selectedGroupNames}
            setSelectedGroupNames={(selectedGroupNames) => {
              dispatch({
                type: "selectGroupNames",
                payload: { selectedGroupNames },
              });
            }}
          />
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
                });
              }}
            />
          )}
          <TypesInput
            typeName="Scopes"
            label="Scopes"
            isLoading={loadingInputs}
            types={scopes.map((scope) => ({ name: scope, color: "#000" }))}
            selectedTypes={selectedScopes}
            setSelectedTypes={(selectedScopes) => {
              dispatch({
                type: "selectScopes",
                payload: { selectedScopes },
              });
            }}
          />
          <RadioSelect
            label="Unit"
            inputName="Unit"
            selectedOption={selectedCO2Unit}
            options={Object.keys(emissionsUnits)}
            onChange={(selectedCO2Unit) => {
              dispatch({
                type: "selectEmissionsUnit",
                payload: { selectedCO2Unit },
              });
            }}
          />
          <ChartTypesSelect
            aria-label="chartTypes"
            selected={selectedChartType}
            available={chartTypes}
            onChange={(value: ChartType) => {
              switch (value) {
                case "pie":
                  dispatch({
                    type: "selectPie",
                  });
                  break;
                case "line":
                  dispatch({ type: "selectLine" });
                  break;
                case "stacked":
                  dispatch({ type: "selectStacked" });
                  break;
                case "ranking":
                  dispatch({ type: "selectRanking" });
                  break;
                case "stacked-percent":
                  dispatch({ type: "selectStackedPercent" });
                  break;
                default:
                  console.warn(`ChartTypes input "${value}" didn't match any chartTypes`);
              }
            }}
          />
        </SelectContainer>
      </Fragment>
    );
  }
  if (iframe) {
    return (
      <StackedChart
        onYearRangeChange={onYearRangeChange}
        isRange={isRange}
        ref={stackedChartRef}
        unit={selectedCO2Unit}
        isLoading={dimensionLoading}
        type={selectedChartType}
        yearRange={selectedYearRange}
        title={graphTitle}
        iframe={iframe}
        chartHeight={chartHeight}
        highchartsSeriesAndCategories={
          dimensionData?.footprint && dimensionData.footprint[selectedDimension]
            ? ({
                series: dimensionData.footprint[selectedDimension].series,
                categories: dimensionData.footprint[selectedDimension].categories,
              } as StackedChartProps["highchartsSeriesAndCategories"])
            : { series: [], categories: [] }
        }
      />
    );
  }
  return (
    <Fragment>
      <Head>
        <title>The Shift Project - {graphTitle}</title>
      </Head>
      <Nav />
      <Main>
        <CategoryName type="CLIMATE" />
        <MainChartTitle>
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} CO<sub>2</sub> Footprint
        </MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={selectedCO2Unit}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            title={graphTitle}
            highchartsSeriesAndCategories={
              dimensionData?.footprint && dimensionData.footprint[selectedDimension]
                ? ({
                    series: dimensionData.footprint[selectedDimension].series,
                    categories: dimensionData.footprint[selectedDimension].categories,
                  } as StackedChartProps["highchartsSeriesAndCategories"])
                : { series: [], categories: [] }
            }
          />
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.footprint?.mdInfos && <GraphInfos>{dataInputs.footprint.mdInfos}</GraphInfos>}
        <SharingButtons title={graphTitle} />
        <CTA>
          <CTA.Energy />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  );
};
Footprint.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedScopes: query["scopes"]
        ? Array.isArray(query["scopes"])
          ? (query["scopes"] as string[])
          : [query["scopes"] as string]
        : ["CO2 Footprint"],
      selectedGdpUnit: (query["gdp-unit"] as string) ? (query["gdp-unit"] as string) : "GDP (constant 2010 US$)",
      selectedDimension: (query["dimension"] as FootprintDimensions)
        ? (query["dimension"] as FootprintDimensions)
        : FootprintDimensions.Total,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "line",
      chartTypes: (query["chart-types"] as ChartType[] | ChartType)
        ? Array.isArray(query["chart-types"] as ChartType[] | ChartType)
          ? (query["chart-types"] as ChartType[])
          : [query["chart-types"] as ChartType]
        : (["line", "ranking"] as ChartType[]),
      selectedGroupNames: (query["group-names"] as string[] | string)
        ? Array.isArray(query["group-names"] as string[] | string)
          ? (query["group-names"] as string[])
          : [query["group-names"] as string]
        : ["World"],
      selectedCO2Unit: (query["emissions-unit"] as Co2Unit) ? (query["emissions-unit"] as Co2Unit) : Co2Unit.MtCo2,
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
  };
};

export const INPUTS = gql`
  query footprintInputs {
    footprint {
      mdInfos
      emissionsUnits
      scopes
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
      gdpUnits
      dimensions
    }
  }
`;

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getFootprintDimension(
    $gdpUnit: String!
    $groupNames: [String]!
    $emissionsUnit: CO2Unit!
    $total: Boolean!
    $perCapita: Boolean!
    $yearStart: Int!
    $perGDP: Boolean!
    $yearEnd: Int!
    $dimension: FootprintDimensions!
    $scopes: [String]!
  ) {
    footprint {
      multiSelects(dimension: $dimension) {
        name
        data {
          name
          color
        }
      }
      total(
        groupNames: $groupNames
        emissionsUnit: $emissionsUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        scopes: $scopes
      ) @include(if: $total) {
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
          color
          dashStyle
        }
      }
      perGDP(
        gdpUnit: $gdpUnit
        groupNames: $groupNames
        emissionsUnit: $emissionsUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        scopes: $scopes
      ) @include(if: $perGDP) {
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
          color
          dashStyle
        }
      }
      perCapita(
        groupNames: $groupNames
        emissionsUnit: $emissionsUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        scopes: $scopes
      ) @include(if: $perCapita) {
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
          color
          dashStyle
        }
      }
    }
  }
`;
interface DefaultProps {
  params: ReducerState;
}
interface ReducerState {
  chartTypes: ChartType[];
  selectedChartType: ChartType;
  selectedDimension: FootprintDimensions;
  selectedCO2Unit: GetFootprintDimensionQueryVariables["emissionsUnit"];
  selectedGroupNames: GetFootprintDimensionQueryVariables["groupNames"];
  selectedGdpUnit: GetFootprintDimensionQueryVariables["gdpUnit"];
  selectedScopes: GetFootprintDimensionQueryVariables["scopes"];
  iframe: boolean;
  isRange: boolean;
  selectedYearRange: Range;
  chartHeight: string;
}
type ReducerActions =
  | FootprintDimensions
  | "selectGroupNames"
  | "selectEmissionsUnit"
  | "selectGdpUnit"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectScopes"
  | "selectYears";
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions;
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"];
      selectedCO2Unit?: ReducerState["selectedCO2Unit"];
      selectedDimension?: ReducerState["selectedDimension"];
      selectedGdpUnit?: ReducerState["selectedGdpUnit"];
      selectedYearRange?: ReducerState["selectedYearRange"];
      selectedScopes?: ReducerState["selectedScopes"];
    };
  }
> = (prevState, action) => {
  switch (action.type) {
    case FootprintDimensions.PerGdp:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: FootprintDimensions.PerGdp,
        selectedCO2Unit: Co2Unit.TCo2,
      };
    case FootprintDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: FootprintDimensions.Total,
        selectedCO2Unit: Co2Unit.MtCo2,
        isRange: true,
      };
    case FootprintDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: FootprintDimensions.PerCapita,
        selectedCO2Unit: Co2Unit.TCo2,
        isRange: true,
      };
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      };
    case "selectScopes":
      return {
        ...prevState,
        selectedScopes: action.payload.selectedScopes,
      };
    case "selectEmissionsUnit":
      return {
        ...prevState,
        selectedCO2Unit: action.payload.selectedCO2Unit,
      };
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      };
    case "selectGdpUnit":
      return {
        ...prevState,
        selectedGdpUnit: action.payload.selectedGdpUnit,
      };
    case "selectPie":
      return {
        ...prevState,
        selectedGdpUnit: action.payload.selectedGdpUnit,
        selectedChartType: "pie",
        isRange: false,
      };
    case "selectStacked":
      return {
        ...prevState,
        selectedChartType: "stacked",
        isRange: true,
      };
    case "selectStackedPercent":
      return {
        ...prevState,
        selectedChartType: "stacked-percent",
        isRange: true,
      };
    case "selectLine":
      return {
        ...prevState,
        selectedChartType: "line",
        isRange: true,
      };
    case "selectRanking":
      return {
        ...prevState,
        selectedChartType: "ranking",
        isRange: false,
      };
    case "selectYears":
      return {
        ...prevState,
        selectedYearRange: action.payload.selectedYearRange,
      };
    default:
      console.warn(`Reducer didn't match any action of type ${action.type}`);
      return prevState;
  }
};

export default Footprint;
