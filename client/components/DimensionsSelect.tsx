import { useMemo } from "react"
import { DimensionButton, InputSubtitle } from "."
import { IDimension as ReadableIDimension } from "../pages/energy"
import React from "react"

import styled from "@emotion/styled"
import { space } from "styled-system"
import { IconName } from "./Icons"
import dimensionToHumanReadable, { IDimension } from "../utils/dimensionToHumanReadable"

interface IProps {
  dimensions: IDimension[]
  onChange?: any
  selectedDimension: string
}

const DimensionsSelect: React.FC<IProps> = ({ dimensions, onChange, selectedDimension }) => {
  const dimensionsWithIcons = useMemo(
    () =>
      dimensions.map(
        (
          dimension
        ): {
          title: ReadableIDimension["title"]
          icon: IconName
          dimension: IDimension
        } => {
          const title = dimensionToHumanReadable(dimension)
          switch (dimension) {
            case "byGas":
              return { dimension, title, icon: "StackedChart" }
            case "perCapita":
              return { dimension, title, icon: "Capita" }
            case "total":
              return { dimension, title, icon: "LineChart" }
            case "perGDP":
              return { dimension, title, icon: "Dollar" }
            case "byEnergyFamily":
              return { dimension, title, icon: "StackedChart" }
            case "bySector":
              return { dimension, title, icon: "StackedChart" }
            case "ranking":
              return { dimension, title, icon: "TopChart" }
            case "provenReserve":
              return { dimension, title, icon: "ProvenReserves" }
            case "oldExtrapolation":
              return { dimension, title, icon: "LineChart" }
            case "extrapolation":
              return { dimension, title, icon: "LineChart" }
            case "importExport":
              return { dimension, title, icon: "ImportExport" }
            case "shareOfPrimaryEnergy":
              return { dimension, title, icon: "PieChart" }
            case "shareOfElectricityGeneration":
              return { dimension, title, icon: "PieChart" }
            case "byCountry":
              return { dimension, title, icon: "TopChart" }
            case "byContinent":
              return { dimension, title, icon: "TopChart" }
            default:
              console.warn(`Dimension Icon : ${dimension} not found, fallbacking to the stacked chart icon`)
              return { dimension, title: "by sector", icon: "StackedChart" }
          }
        }
      ),
    [dimensions]
  )
  return (
    <Container mt={[4]}>
      <InputSubtitle>DATASETS</InputSubtitle>
      <Dimensions>
        {dimensionsWithIcons.map((dimensionIcon, i) => (
          <div onClick={() => onChange(dimensionIcon.dimension)} key={i}>
            <DimensionButton
              icon={dimensionIcon.icon}
              selected={selectedDimension === dimensionIcon.dimension}
              active={true}
            >
              {dimensionIcon.title}
            </DimensionButton>
          </div>
        ))}
      </Dimensions>
    </Container>
  )
}
const Container = styled.div`
  ${space};
`
const Dimensions = styled.div`
  display: flex;
  flex-flow: row wrap;
`

export default DimensionsSelect
