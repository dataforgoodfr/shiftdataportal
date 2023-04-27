import InputRange, { Range } from "react-input-range";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import styled from "@emotion/styled"
export interface RangeProps {
  loading: boolean;
  onChange: (range: Range) => void;
  playable: boolean;
  isRange: boolean;
  minYear: number;
  maxYear: number;
  selectedYearRange: Range;
  autoplay: boolean;
}
const RangeInput = ({
  playable,
  loading,
  onChange,
  isRange,
  minYear,
  maxYear,
  selectedYearRange,
  autoplay
}: RangeProps) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // value is the data that is consumed by the react-input-range
  const [value, setValue] = useState<Range | number>(isRange ? { min: minYear, max: maxYear } : maxYear);
  const rangeEl = useRef(null);
  const delay = 400;
  // To animate like a video
  useInterval(
    () => {
      if (selectedYearRange.max < maxYear) {
        onChange({ ...selectedYearRange, max: selectedYearRange.max + 1 });
      } else {
        setIsPlaying(false);
      }
    },
    // Only use interval when it is playing, playable and not a range
    isPlaying && playable && !isRange ? delay : null
  );

  useEffect(() => {
    // This block will set the final value on every single component re-render.
    // Set the real year range value.
    let min: number;
    let max: number;
    // Prevent values to be out of range
    if (selectedYearRange.min < minYear) {
      min = minYear;
      // Tell the parent the new range
      onChange({ ...selectedYearRange, min });
    } else {
      min = selectedYearRange.min;
    }
    //
    if (selectedYearRange.max > maxYear) {
      max = maxYear;
      // Tell the parent the new range
      onChange({ ...selectedYearRange, max });
    } else {
      max = selectedYearRange.max;
    }
    if (isRange) {
      setValue({ min, max });
    } else {
      if (selectedYearRange.max) {
        setValue(max);
      } else {
        setValue(maxYear);
      }
    }
  }, [isRange, maxYear, minYear, onChange, selectedYearRange]);

  useEffect(() => {
    // If years changes set year range to the widest range
    onChange({ min: minYear, max: maxYear });
  }, [minYear, maxYear, onChange]);
  useLayoutEffect(() => {
    if (autoplay && !isRange) {
      onChange({ min: minYear, max: minYear });
      setIsPlaying(true);
    }
  }, [autoplay, isRange, minYear, onChange]);
  if (loading) {
    return <div>loading...</div>;
  } else {
    return (
      <Container>
        {playable && (
          <PlayPauseButton
            onClick={() => {
              // If the cursor is a the end and is not playing, restart the animation from minYear
              if (!isPlaying && selectedYearRange.max === maxYear) {
                onChange({ min: minYear, max: minYear });
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
          >
            {isPlaying ? "PAUSE" : "PLAY"}
          </PlayPauseButton>
        )}
        <InputRange
          ref={rangeEl}
          minValue={minYear}
          maxValue={maxYear}
          value={value}
          onChange={event => {
            // Test if it's a Range or a number
            let res: any;
            if ((event as Range).max) {
              res = event as Range;
            } else {
              // Set min to the old min and keep max as the current reference year.
              res = { min: selectedYearRange.min, max: event as number };
            }
            // "Send" it to the props
            if (res.min !== selectedYearRange.min || res.max !== selectedYearRange.max) {
              onChange(res);
            }
          }}
          draggableTrack={true}
        />
      </Container>
    );
  }
};
function useInterval(callback, delay) {
  const savedCallback = useRef(null);
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const PlayPauseButton = props => <Button {...props}>{props.children}</Button>;
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const Button = styled.button`
  padding: 0;
  border: none;
  font: inherit;
  background-color: transparent;
  color: ${p => p.theme.colors.darkBlue};
  font-weight: 700;
  padding: 5px 8px;
`;
export default React.memo(RangeInput);
