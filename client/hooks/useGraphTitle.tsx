import { useState } from "react"
import dimensionToHumanReadable from "../utils/dimensionToHumanReadable"

const useGraphTitle = (label, selectedGroupNames, selectedYearRange, selectedDimension, isRange, selectedType?) => {
  const [graphTitle, setGraphTitle] = useState<string>("")

  const generateGraphTitle = () => {
    if (selectedType === undefined) selectedType = ""
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    setGraphTitle(`${label} ${selectedType}${displayedDimension} - ${displayedGroupNames} ${displayedYears}`)
  }

  return [graphTitle, generateGraphTitle] as const
}

export default useGraphTitle
