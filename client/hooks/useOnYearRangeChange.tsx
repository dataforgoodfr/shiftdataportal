import { useCallback } from "react";

export default function useOnYearRangeChange(dispatch) {
  return useCallback(
    (selectedYearRange) => {
      dispatch({
        type: "selectYears",
        payload: { selectedYearRange },
      });
    },
    [dispatch]
  );
}
