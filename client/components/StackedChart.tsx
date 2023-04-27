// This component displays every graphs of the dataportal.
// Be careful when changing an option in a chart type e.g a Pie,
// this option will be kept when changing back to a different chart type e.g. Line.
// So please overwrite each option on every other graph type.
import Highcharts, {
  SeriesAreasplineOptions,
  SeriesSplineOptions,
  DashStyleValue,
  AlignValue,
  Options
} from "highcharts";
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsExportData from "highcharts/modules/export-data";
import SeriesLabel from "highcharts/modules/series-label";
import HR from "highcharts-react-official";
import { Range } from "react-input-range";
import { EnergyUnit, Co2Unit, Co2eqUnit } from "../types";
import { format } from "d3-format";
import React, { useEffect, useState, useImperativeHandle, useRef, forwardRef, useCallback } from "react";
import { RangeInput } from ".";
import { useTheme } from "@emotion/react";
import { Theme } from "../lib/styled";
import chroma from "chroma-js";
if (typeof Highcharts === "object") {
  HighchartsExporting(Highcharts);
  HighchartsExportData(Highcharts);
  SeriesLabel(Highcharts);
}

export interface StackedChartProps {
  unit: EnergyUnit | Co2Unit | Co2eqUnit | "Gb" | "Mb/d" | "base 100" | "GW" | "%";
  type: ChartType | "custom";
  yearRange: Range;
  isRange: boolean;
  historical?: boolean;
  highchartsSeriesAndCategories?: {
    categories: Highcharts.XAxisOptions["categories"];
    series: Array<SeriesAreasplineOptions | SeriesSplineOptions>;
  };
  isLoading?: boolean;
  onYearRangeChange: any;
  title?: string;
  customOptions?: Options;
  iframe?: boolean;
  chartHeight?: string;
}
export type ChartType = "stacked" | "stacked-percent" | "line" | "pie" | "ranking";

const StackedChart = (
  {
    type,
    highchartsSeriesAndCategories,
    unit,
    yearRange,
    isLoading = false,
    isRange,
    onYearRangeChange,
    title,
    historical = true,
    customOptions,
    iframe = false,
    chartHeight = "75vh"
  }: StackedChartProps,
  ref
) => {
  const highchartsRef = useRef(null);
  const theme = useTheme();
  const [options, setOptions] = useState<Highcharts.Options>({
    ...defaultOptions(unit, title, theme),
    chart: {
      ...chartOptions(theme),
      type: "areaspline"
    },
    xAxis: { ...xAxisOptions },
    yAxis: { ...yAxisOptions }
  });
  useEffect(() => {
    if (isLoading) {
      highchartsRef.current.chart.showLoading();
    } else {
      highchartsRef.current.chart.hideLoading();
    }
  }, [isLoading]);
  useImperativeHandle(ref, () => ({
    downloadCSV: () => {
      // @ts-ignore
      highchartsRef?.current?.chart && highchartsRef.current.chart.downloadCSV();
    },
    exportChart: () => {
      highchartsRef?.current?.chart &&
        highchartsRef.current.chart.exportChart({ filename: title }, { chart: { height: 450, width: 700 } });
    },
    reflow: () => {
      highchartsRef?.current?.chart && highchartsRef.current.chart.reflow();
    },
    setExtremes: (min, max) => {
      highchartsRef?.current?.chart &&
        highchartsRef.current.chart.xAxis.forEach(axis =>
          axis.update({ min: Date.UTC(min, 0), max: Date.UTC(max, 0) })
        );
    }
  }));

  let RangeComponent;
  const memoizedOnYearRangeChange = useCallback(onYearRangeChange, [onYearRangeChange]);
  if (
    highchartsSeriesAndCategories?.categories[0] &&
    highchartsSeriesAndCategories?.categories[highchartsSeriesAndCategories.categories.length - 1] &&
    historical
  ) {
    RangeComponent = (
      <div style={{ width: "100%", marginTop: "1rem" }}>
        <RangeInput
          playable={!isRange}
          minYear={parseInt(highchartsSeriesAndCategories.categories[0])}
          maxYear={parseInt(
            highchartsSeriesAndCategories.categories[highchartsSeriesAndCategories.categories.length - 1]
          )}
          autoplay={type === "ranking"}
          selectedYearRange={yearRange}
          loading={isLoading}
          isRange={isRange}
          onChange={memoizedOnYearRangeChange}
        />
      </div>
    );
  } else {
    RangeComponent = <div></div>;
  }
  useEffect(() => {
    switch (type) {
      case "stacked":
        setOptions({
          // Always spread the default option for maximum consistency.
          ...defaultOptions(unit, title, theme),
          chart: {
            ...chartOptions(theme),
            type: "areaspline"
          },
          plotOptions: {
            areaspline: {
              lineWidth: 1.5,
              fillOpacity: 0.6,
              marker: {
                enabled: false
              },
              stacking: "normal"
            },
            series: {
              ...defaultPlotOptionsSeries,
              lineWidth: 2,
              label: {
                connectorAllowed: true,
                enabled: true,
                onArea: true,
                style: { fontFamily: theme.fonts.secondary }
              },
              marker: {
                symbol: "circle",
                fillColor: "#FFFFFF",
                lineWidth: 1,
                lineColor: null,
                states: {
                  hover: {
                    radius: 4
                  }
                }
              },
              states: {
                hover: {
                  halo: {
                    size: 1
                  }
                }
              }
            }
          },
          yAxis: { ...yAxisOptions, min: 0, title: { text: unit } },
          xAxis: {
            ...xAxisOptions,
            visible: true,
            min: Date.UTC(yearRange.min, 0),
            max: Date.UTC(yearRange.max, 0)
          },
          series: highchartsSeriesAndCategories.series.map(serie => ({
            ...serie,
            dataLabels: {
              enabled: false
            },
            pointRange: 365 * 24 * 3600 * 1000,
            data: serie.data.map((item, index) => {
              // @ts-ignore
              return [Date.UTC(highchartsSeriesAndCategories.categories[index], 0), item];
            })
          }))
        });
        break;
      case "stacked-percent":
        setOptions({
          ...defaultOptions(unit, title, theme),
          chart: {
            ...chartOptions(theme),
            type: "areaspline"
          },
          plotOptions: {
            areaspline: {
              lineWidth: 1,
              fillOpacity: 0.6,
              marker: {
                enabled: false
              },
              stacking: "percent"
            },
            series: {
              ...defaultPlotOptionsSeries,
              lineWidth: 2,
              label: {
                connectorAllowed: true,
                enabled: true,
                onArea: true,
                style: { fontFamily: theme.fonts.secondary }
              },
              marker: {
                symbol: "circle",
                fillColor: "#FFFFFF",
                lineWidth: 1,
                lineColor: null,
                states: {
                  hover: {
                    radius: 4
                  }
                }
              },
              states: {
                hover: {
                  halo: {
                    size: 1
                  }
                }
              }
            }
          },
          yAxis: {
            ...yAxisOptions,
            min: 0,
            max: 100,
            title: { text: "%" }
          },
          xAxis: {
            ...xAxisOptions,
            visible: true,
            min: Date.UTC(yearRange.min, 0),
            max: Date.UTC(yearRange.max, 0)
          },
          series: highchartsSeriesAndCategories.series.map(serie => ({
            ...serie,
            dataLabels: {
              enabled: false
            },
            pointRange: 365 * 24 * 3600 * 1000,
            data: serie.data.map((item, index) => {
              // @ts-ignore
              return [Date.UTC(highchartsSeriesAndCategories.categories[index], 0), item];
            })
          }))
        });
        break;
      case "line":
        setOptions({
          ...defaultOptions(unit, title, theme),
          chart: {
            ...chartOptions(theme),
            type: "spline"
          },
          plotOptions: {
            spline: {
              connectNulls: true,
              label: {
                enabled: true,
                connectorAllowed: false,
                onArea: false,
                style: { fontFamily: theme.fonts.secondary }
              },
              lineWidth: 1.5,
              marker: {
                enabled: false
              }
            },
            series: {
              ...defaultPlotOptionsSeries,
              marker: {
                symbol: "circle",
                fillColor: "#FFFFFF",
                lineWidth: 1,
                lineColor: null,
                states: {
                  hover: {
                    radius: 4
                  }
                }
              },
              states: {
                hover: {
                  halo: {
                    size: 1
                  }
                }
              }
            }
          },
          yAxis: { ...yAxisOptions, softMin: 0, title: { text: unit }, max: unit === "%" ? 100 : null },
          xAxis: {
            ...xAxisOptions,
            visible: true,
            min: Date.UTC(yearRange.min, 0),
            max: Date.UTC(yearRange.max, 0)
          },
          series: highchartsSeriesAndCategories.series.map(serie => ({
            ...serie,
            dataSorting: {
              enabled: false
            },
            dataLabels: {
              enabled: false
            },
            pointRange: 365 * 24 * 3600 * 1000,
            data: serie.data.map((item, index) => {
              // @ts-ignore
              return [Date.UTC(highchartsSeriesAndCategories.categories[index], 0), item];
            })
          }))
        });
        break;
      case "pie":
        setOptions({
          ...defaultOptions(unit, title, theme),
          chart: {
            ...chartOptions(theme),
            type: "pie",
            animation: { duration: 300 }
          },
          tooltip: {
            ...toolTipOptions(unit, false),
            enabled: false
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              innerSize: "50%",
              borderWidth: 1,
              dataLabels: {
                enabled: true,
                format: "<b>{point.name}</b>: {point.percentage:.1f} %"
              }
            }
          },
          yAxis: { ...yAxisOptions, title: { text: unit } },
          xAxis: {
            ...xAxisOptions,
            categories: highchartsSeriesAndCategories.categories,
            crosshair: true,
            visible: false
          },
          series: [
            {
              dataSorting: {
                enabled: false
              },
              dataLabels: {
                enabled: true,
                format: "<b>{point.name}</b>: {point.percentage:.1f} %"
              },
              name: "Pie",
              type: null,
              data: highchartsSeriesAndCategories.series.map(serie => ({
                pointRange: 365 * 24 * 3600 * 1000,
                name: serie.name,
                y: serie.data[findCategoriesMaxIndex(highchartsSeriesAndCategories.categories, yearRange)],
                color: serie.color
              }))
            }
          ]
        });
        break;
      case "ranking":
        setOptions({
          ...defaultOptions(unit, title, theme),
          legend: { enabled: false },
          chart: {
            ...chartOptions(theme),
            type: "bar",
            animation: { duration: 300 }
          },
          yAxis: null,
          xAxis: {
            ...xAxisOptions,
            type: "category",
            categories: null,
            visible: false,
            min: 0,
            crosshair: false,
            max: 10
          },
          tooltip: {
            enabled: false
          },
          series: [
            {
              type: undefined,
              dataSorting: {
                enabled: true,
                sortKey: "y"
              },
              pointWidth: 25,
              borderRadius: 1,
              minPointLength: 40,
              dataLabels: {
                enabled: true,
                inside: true,
                align: "left",
                format: `{point.name}<br/>{point.y:.1f} ${unit}`,
                style: { textOutline: "none", color: "black", fontSize: theme.fontSizes[1], textAlign: "right" }
              },
              data: highchartsSeriesAndCategories.series.slice(0, 9).map(serie => ({
                borderColor: serie.color,
                name: serie.name,
                y: serie.data[findCategoriesMaxIndex(highchartsSeriesAndCategories.categories, yearRange)],
                color: chroma(serie.color as string)
                  .alpha(0.4)
                  .css()
              }))
            }
          ]
        });
        break;
      case "custom":
        setOptions({
          ...customOptions
        });
        break;
    }
  }, [
    customOptions,
    highchartsSeriesAndCategories.categories,
    highchartsSeriesAndCategories.series,
    theme,
    title,
    type,
    unit,
    yearRange,
    yearRange.min
  ]);

  return (
    <Wrapper isLoading={isLoading} RangeComponent={RangeComponent} iframe={iframe}>
      <HR
        containerProps={{ style: { height: chartHeight, width: "100%" } }}
        ref={highchartsRef}
        highcharts={Highcharts}
        options={options}
      />
    </Wrapper>
  );
};

const Wrapper = props => (
  <div className="screenshot" style={{ position: "relative" }}>
    {props.children}
    {!props.iframe && props.RangeComponent}
  </div>
);
const chartOptions = (theme: Theme): Options["chart"] => ({
  style: { color: theme.fonts.secondary, fontFamily: theme.fonts.secondary },
  backgroundColor: theme.colors.backgroundColor
});
const yAxisOptions: Options["yAxis"] = {
  softMin: 0,
  max: null,
  softMax: null
};
const xAxisOptions: Options["xAxis"] = {
  crosshair: { width: 1, color: "gray", dashStyle: "Dash" as DashStyleValue, snap: false },
  categories: null,
  visible: undefined,
  type: "datetime",
  tickInterval: 365 * 24 * 3600 * 1000 * 5,
  dateTimeLabelFormats: {
    year: "%Y"
  }
};
const defaultOptions = (unit: string, title: string, theme: Theme): Options => ({
  title: {
    text: title?.length > 66 ? title.slice(0, 66) + "..." : title,
    align: "left" as AlignValue,
    x: 0,
    style: { fontFamily: theme.fonts.secondary, fontSize: "1rem", color: theme.colors.darkBlue }
  },
  legend: { enabled: true, align: "left", itemDistance: 5 },
  loading: {
    hideDuration: 500,
    showDuration: 500,
    style: {
      backgroundColor: theme.colors.backgroundColor,
      fontFamily: theme.fonts.secondary,
      color: theme.colors.darkBlue
    }
  },
  chart: chartOptions(theme),
  tooltip: toolTipOptions(unit, true),
  credits: {
    text: "The Shift Dataportal",
    href: "https://theshiftproject.org/"
  },
  exporting: {
    enabled: false,
    filename: title + " (in " + unit + ")",
    csv: {
      columnHeaderFormatter: i => {
        return i.name;
      }
    }
  }
});
const defaultPlotOptionsSeries: Options["plotOptions"]["series"] = {
  events: {
    legendItemClick: e => {
      e.preventDefault();
    }
  }
};
const toolTipOptions = (unit, enabled): Options["tooltip"] => ({
  enabled,
  shared: true,
  backgroundColor: "white",
  borderRadius: 1,
  borderColor: "#E3E3E3",
  borderWidth: 0,
  useHTML: true,
  shadow: {
    offsetX: 0,
    offsetY: 1,
    color: "black",
    opacity: 0.1
  },
  formatter: function() {
    return this.points.reduce((previousValue, currentPoint) => {
      // Returns a line
      return (
        previousValue +
        "<br/>" +
        `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="5" height="5">
        <circle  cx="5" cy="5" r="5" fill="${currentPoint.color}"/>
      </svg>` +
        " " +
        currentPoint.series.name +
        ": " +
        format(",.3r")(currentPoint.y).replace(",", " ") +
        " " +
        unit
      );
      // Initial reduce value that will represent the year
    }, "<b>" + (new Date(this.x).getFullYear() ? new Date(this.x).getFullYear() : ((this.x as unknown) as string)) + "</b>");
  }
});

// Function used for none range graphs (Pie or Ranking), to get the closest correct maxYear to display.
// Since some graphs have only values every 5 years and the years only increment by 1 it has to return a value for every single years.
const findCategoriesMaxIndex = (categories, yearRange) => {
  const closestCategory = categories.reduce(function(prev, curr) {
    return Math.abs(curr - yearRange.max) < Math.abs(prev - yearRange.max) ? curr : prev;
  });
  const maxIndex = categories.findIndex(year => closestCategory && closestCategory.toString() === year);
  return maxIndex === -1 ? 0 : maxIndex;
};

export default React.memo(forwardRef(StackedChart));
