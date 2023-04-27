import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { NextPage } from "next";
import Head from "next/head";
import { ParsedUrlQueryInput } from "querystring";
import React, { Fragment, useEffect, useReducer, useState, useRef } from "react";
import {
  Footer,
  GroupNamesSelect,
  Nav,
  Main,
  Share,
  DimensionsSelect,
  RadioSelect,
  CategoryName,
  MainChartTitle,
  CTA,
  GraphInfos,
  SelectContainer,
  TypesInput,
  SharingButtons,
} from "../../components";
import StackedChart from "../../components/StackedChart";
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl";
import {
  Co2eqUnit,
  GetCo2ImportsExportsDimensionQuery,
  GetCo2ImportsExportsDimensionQueryVariables,
  Co2ImportsExportsDimensions,
  Co2ImportsExportsInputsQuery,
  Co2ImportsExportsInputsQueryVariables,
} from "../../types";
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton";
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange";
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable";
import { Options } from "highcharts";
import chroma from "chroma-js";
import { useTheme } from "@emotion/react";
import { Theme } from "../../lib/styled";

const Co2ImportsExports: NextPage<DefaultProps> = ({ params }) => {
  const theme = useTheme();
  const stackedChartRef = useRef(null);
  // Reducer state
  const [
    { selectedDimension, isGroupNamesMulti, selectedGroupNames, selectedCo2eqUnit, selectedTypes, chartHeight, iframe },
    dispatch,
  ] = useReducer(reducer, { ...params });
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    Co2ImportsExportsInputsQuery,
    Co2ImportsExportsInputsQueryVariables
  >(INPUTS, { variables: { dimension: selectedDimension } });

  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}));

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "emissions-unit": selectedCo2eqUnit,
      "group-names": selectedGroupNames,
      dimension: selectedDimension,
      multi: isGroupNamesMulti,
      types: selectedTypes,
    });
  }, [selectedDimension, selectedCo2eqUnit, selectedGroupNames, isGroupNamesMulti, selectedTypes]);
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams);

  const [graphTitle, setGraphTitle] = useState<string>("");
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetCo2ImportsExportsDimensionQuery,
    GetCo2ImportsExportsDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      groupName: selectedGroupNames[0],
      emissionsUnit: selectedCo2eqUnit,
      types: selectedTypes,
      total: selectedDimension === "total",
      bySector: selectedDimension === "bySector",
      byCountry: selectedDimension === "byCountry",
      byContinent: selectedDimension === "byContinent",
    },
  });

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : "";
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : "";
    setGraphTitle(`CO2 Imports/Exports${displayedDimension}, ${displayedGroupNames} 2015`);
  }, [selectedGroupNames, selectedDimension]);
  const [customOptions, setCustomOptions] = useState<Options>({ series: [] });
  useEffect(() => {
    const highchartsSeriesAndCategories = dimensionData?.co2ImportsExports?.[selectedDimension]
      ? {
          series: dimensionData.co2ImportsExports[selectedDimension].series,
          categories: dimensionData.co2ImportsExports[selectedDimension].categories,
        }
      : { series: [], categories: [] };

    switch (selectedDimension) {
      case "bySector":
      case "byCountry":
      case "byContinent":
        setCustomOptions({
          chart: {
            type: "column",
          },
          title: {
            text: graphTitle,
          },
          xAxis: {
            categories: highchartsSeriesAndCategories.categories,
            crosshair: false,
            tickInterval: 1,
          },
          yAxis: {
            min: 0,
            title: {
              text: selectedCo2eqUnit,
            },
          },
          tooltip: {
            enabled: true,
            shared: false,
            backgroundColor: "white",
            borderRadius: 1,
            borderColor: "#E3E3E3",
            borderWidth: 0,
            useHTML: true,
            shadow: {
              offsetX: 0,
              offsetY: 1,
              color: "black",
              opacity: 0.1,
            },
            formatter: null,
          },
          series: highchartsSeriesAndCategories.series.map((serie) => ({
            ...serie,
            color: serie.color,
            borderRadius: 3,
            type: "column",
            stacking: "normal",
            dataSorting: {
              enabled: false,
            },
            dataLabels: {
              enabled: true,
              inside: true,
              align: "center",
              formatter: function () {
                return this.point.name.length > 18 ? `${this.point.name.slice(0, 16)}...` : this.point.name;
              },
              style: { textOutline: "none", color: "black", fontSize: theme.fontSizes[1], textAlign: "right" },
            },
            pointRange: null,
            data: serie.data.map((item) => {
              return {
                borderColor: serie.color,
                y: item,
                name: serie.name,
                color: chroma(serie.color as string)
                  .alpha(0.4)
                  .css(),
              };
            }),
          })),
        });
        break;
      case "total":
        setCustomOptions({
          chart: {
            type: "column",
          },
          title: {
            text: graphTitle,
          },
          xAxis: {
            categories: highchartsSeriesAndCategories.categories,
            crosshair: false,
            tickInterval: 1,
          },
          yAxis: {
            min: 0,
            title: {
              text: selectedCo2eqUnit,
            },
          },
          tooltip: {
            enabled: true,
            shared: false,
            backgroundColor: "white",
            borderRadius: 1,
            borderColor: "#E3E3E3",
            borderWidth: 0,
            useHTML: true,
            shadow: {
              offsetX: 0,
              offsetY: 1,
              color: "black",
              opacity: 0.1,
            },
            formatter: null,
          },
          series: highchartsSeriesAndCategories.series.map((serie) => ({
            ...serie,
            color: serie.color,
            borderRadius: 3,
            type: "column",
            stacking: undefined,
            dataSorting: {
              enabled: false,
            },
            dataLabels: {
              enabled: false,
            },
            pointRange: null,
            data: serie.data.map((item) => {
              return {
                borderColor: serie.color,
                y: item,
                name: serie.name,
                color: chroma(serie.color as string)
                  .alpha(0.4)
                  .css(),
              };
            }),
          })),
        });
        break;
    }
  }, [dimensionData, graphTitle, selectedCo2eqUnit, selectedDimension, theme.fontSizes]);
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
  } else if (loadingInputs || !dataInputs || !dataInputs.co2ImportsExports) {
    inputs = <p>Loading...</p>;
  } else {
    const { emissionsUnits, countries, dimensions, types } = dataInputs.co2ImportsExports;
    inputs = (
      <Fragment>
        <div>
          <DimensionsSelect
            dimensions={dimensions}
            onChange={(newDimension) =>
              dispatch({
                type: newDimension as ReducerActions,
              })
            }
            selectedDimension={selectedDimension}
          />
        </div>
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            multiSelect={[
              ...(dimensionData?.co2ImportsExports?.total?.multiSelects
                ? dimensionData.co2ImportsExports.total.multiSelects
                : []),
              ...(dimensionData?.co2ImportsExports?.multiSelects ? dimensionData.co2ImportsExports.multiSelects : []),
            ]}
            zones={[]}
            groups={[]}
            countries={countries}
            value={selectedGroupNames}
            setSelectedGroupNames={(selectedGroupNames) => {
              dispatch({
                type: "selectGroupNames",
                payload: { selectedGroupNames },
              });
            }}
          />
          <TypesInput
            typeName="Import/Export"
            label="Import/Export"
            isLoading={loadingInputs}
            types={types.map((type) => ({ name: type, color: "#000000" }))}
            selectedTypes={selectedTypes}
            setSelectedTypes={(selectedTypes) => {
              dispatch({
                type: "selectTypes",
                payload: { selectedTypes },
              });
            }}
          />
          {selectedDimension === "total" && (
            <RadioSelect
              label="Unit"
              inputName="Unit"
              selectedOption={selectedCo2eqUnit}
              options={Object.keys(emissionsUnits)}
              onChange={(selectedCo2eqUnit) => {
                dispatch({
                  type: "selectCo2eqUnit",
                  payload: { selectedCo2eqUnit },
                });
              }}
            />
          )}
        </SelectContainer>
      </Fragment>
    );
  }
  if (iframe) {
    return (
      <StackedChart
        iframe={iframe}
        chartHeight={chartHeight}
        onYearRangeChange={onYearRangeChange}
        isRange={false}
        historical={false}
        yearRange={{ min: 0, max: 0 }}
        ref={stackedChartRef}
        unit={selectedCo2eqUnit}
        isLoading={dimensionLoading}
        // This will tell the component not to handle the options on it's side.
        type={"custom"}
        customOptions={customOptions}
        title={graphTitle}
        highchartsSeriesAndCategories={{ series: [], categories: [] }}
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
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} CO2 Imports/Exports
        </MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={false}
            historical={false}
            yearRange={{ min: 0, max: 0 }}
            ref={stackedChartRef}
            unit={selectedCo2eqUnit}
            isLoading={dimensionLoading}
            // This will tell the component not to handle the options on it's side.
            type={"custom"}
            customOptions={customOptions}
            title={graphTitle}
            highchartsSeriesAndCategories={{ series: [], categories: [] }}
          />
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.co2ImportsExports?.mdInfos && <GraphInfos>{dataInputs.co2ImportsExports.mdInfos}</GraphInfos>}
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
Co2ImportsExports.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedDimension: (query["dimension"] as Co2ImportsExportsDimensions)
        ? (query["dimension"] as Co2ImportsExportsDimensions)
        : Co2ImportsExportsDimensions.Total,
      selectedGroupNames: (query["group-names"] as string[] | string)
        ? Array.isArray(query["group-names"] as string[] | string)
          ? (query["group-names"] as string[])
          : [query["group-names"] as string]
        : ["France"],
      selectedTypes: (query["types"] as string[] | string)
        ? Array.isArray(query["types"] as string[] | string)
          ? (query["types"] as string[])
          : [query["types"] as string]
        : ["CO2 Imports", "CO2 Exports"],
      selectedCo2eqUnit: (query["emissions-unit"] as Co2eqUnit)
        ? (query["emissions-unit"] as Co2eqUnit)
        : Co2eqUnit.MtCo2eq,
      // Group name multi only when dimension is "byEnergyFamily"
      isGroupNamesMulti: (query["multi"] as String) === undefined ? false : query["multi"] === "true" ? true : false,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  };
};

export const INPUTS = gql`
  query co2ImportsExportsInputs($dimension: Co2ImportsExportsDimensions!) {
    co2ImportsExports {
      mdInfos
      emissionsUnits
      countries(dimension: $dimension) {
        name
        color
      }
      dimensions
      types(dimension: $dimension)
    }
  }
`;

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getCo2ImportsExportsDimension(
    $groupNames: [String]!
    $groupName: String
    $emissionsUnit: CO2eqUnit!
    $total: Boolean!
    $byCountry: Boolean!
    $byContinent: Boolean!
    $bySector: Boolean!
    $types: [String]!
  ) {
    co2ImportsExports {
      multiSelects {
        name
        data {
          name
          color
        }
      }
      total(groupNames: $groupNames, emissionsUnit: $emissionsUnit, types: $types) @include(if: $total) {
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
      byCountry(groupName: $groupName, types: $types, numberOfCountries: 8) @include(if: $byCountry) {
        categories
        series {
          name
          data
          color
        }
      }
      byContinent(groupName: $groupName, types: $types) @include(if: $byContinent) {
        categories
        series {
          name
          data
          color
        }
      }
      bySector(groupName: $groupName, types: $types, numberOfSectors: 6) @include(if: $bySector) {
        categories
        series {
          name
          data
          color
        }
      }
    }
  }
`;
interface DefaultProps {
  params: ReducerState;
}
interface ReducerState {
  isGroupNamesMulti: boolean;
  selectedDimension: Co2ImportsExportsDimensions;
  selectedCo2eqUnit: GetCo2ImportsExportsDimensionQueryVariables["emissionsUnit"];
  selectedGroupNames: GetCo2ImportsExportsDimensionQueryVariables["groupNames"];
  selectedTypes: GetCo2ImportsExportsDimensionQueryVariables["types"];
  iframe: boolean;
  chartHeight: string;
}
type ReducerActions =
  | Co2ImportsExportsDimensions
  | "selectGroupNames"
  | "selectCo2eqUnit"
  | "selectSectors"
  | "selectGases"
  | "selectTypes"
  | "selectDimension";
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions;
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"];
      selectedCo2eqUnit?: ReducerState["selectedCo2eqUnit"];
      selectedDimension?: ReducerState["selectedDimension"];
      selectedTypes?: ReducerState["selectedTypes"];
    };
  }
> = (prevState, action) => {
  switch (action.type) {
    case Co2ImportsExportsDimensions.BySector:
      return {
        ...prevState,
        selectedDimension: Co2ImportsExportsDimensions.BySector,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
      };
    case Co2ImportsExportsDimensions.Total:
      return {
        ...prevState,
        selectedDimension: Co2ImportsExportsDimensions.Total,
        isGroupNamesMulti: true,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
      };
    case Co2ImportsExportsDimensions.ByCountry:
      return {
        ...prevState,
        selectedDimension: Co2ImportsExportsDimensions.ByCountry,
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
      };
    case Co2ImportsExportsDimensions.ByContinent:
      return {
        ...prevState,
        selectedDimension: Co2ImportsExportsDimensions.ByContinent,
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
      };
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      };
    case "selectCo2eqUnit":
      return {
        ...prevState,
        selectedCo2eqUnit: action.payload.selectedCo2eqUnit,
      };
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      };
    case "selectTypes":
      return {
        ...prevState,
        selectedTypes: action.payload.selectedTypes,
      };
    default:
      console.warn(`Reducer didn't match any action of type ${action.type}`);
      return prevState;
  }
};

export default Co2ImportsExports;
