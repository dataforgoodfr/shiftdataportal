/* eslint-disable no-sparse-arrays */
import chroma from "chroma-js"
import React, { useState, useRef, Fragment } from "react"
import makeAnimated from "react-select/animated"
import stringToColor from "../utils/stringToColor"
import { MultiSelect, NameColor } from "../types"
import { Theme } from "../lib/styled"
import popup from "../styles/popup"
import { Title, PopupTitle } from "./RadioSelect"
import Select from "react-select"
import { layout, space } from "styled-system"
import { InputSubtitle } from "."
import { useTheme } from "@emotion/react"
import styled from "@emotion/styled"

interface IProps {
  isMulti: boolean
  zones: NameColor[]
  groups: NameColor[]
  countries: NameColor[]
  value: string[] | string
  setSelectedGroupNames: any
  multiSelect?: MultiSelect[]
  isLoading?: boolean
}
const GroupNamesSelect: React.FC<IProps> = ({
  zones,
  groups,
  countries,
  value,
  setSelectedGroupNames,
  isMulti,
  multiSelect = [],
  isLoading = false,
}) => {
  const [showPopup, setShowPopup] = useState(false)
  const theme = useTheme()
  const popupRef = useRef(null)
  /*useOutsideClick(popupRef, () => {
    if (showPopup) {
      setShowPopup(false);
    }
  });*/
  return (
    <Container mx={[1]}>
      <InputSubtitle>Countries</InputSubtitle>
      <Title onClick={() => setShowPopup(!showPopup)} fontSize={[3]} px={[3]} minWidth={[8]}>
        {isLoading ? "loading..." : <Fragment>{value.length === 1 ? value[0] : `${value.length} selected`}</Fragment>}
      </Title>
      {showPopup && (
        <Popup show={showPopup} ref={popupRef} width={["90vw", "90vw"]} maxWidth={["1rem", "30rem"]}>
          <PopupTitle mt={[3]}>
            Countries, Zones, Regions {value.length === 0 ? "" : `·  ${value.length} selected `}
          </PopupTitle>
          {showPopup && (
            <Select
              instanceId="group-name-select"
              menuIsOpen={true}
              menuPlacement="bottom"
              autoFocus={true}
              closeMenuOnSelect={false}
              isClearable={true}
              isLoading={isLoading}
              components={makeAnimated()}
              isMulti={isMulti}
              isSearchable={true}
              name="groupNames"
              aria-label="group names"
              styles={colourStyles(theme)}
              placeholder="Countries, Zones and Groups"
              value={value.map((selectedGroupName) => ({
                label: selectedGroupName,
                value: selectedGroupName,
                color: stringToColor(selectedGroupName),
              }))}
              options={[
                // Only show multi-select when isMulti is true (conditional spreading)
                ...(isMulti
                  ? [
                      {
                        label: "Multi-select",
                        options: multiSelect.map((multi) => {
                          return {
                            label: multi.name,
                            value: multi.data,
                            group: "multiselect",
                          }
                        }),
                      },
                    ]
                  : []),
                ,
                {
                  label: "Zones",
                  options: zones.map(({ name, color }) => ({
                    label: name,
                    value: name,
                    group: "zones",
                    color,
                  })),
                },
                {
                  label: "Groups",
                  options: groups.map(({ name, color }) => ({
                    label: name,
                    value: name,
                    group: "groups",
                    color,
                  })),
                },
                {
                  label: "Countries",
                  options: countries.map(({ name, color }) => ({
                    label: name,
                    value: name,
                    group: "countries",
                    color,
                  })),
                },
              ]}
              onChange={(
                result:
                  | { value: string } /* Case when not multi */
                  | { value: string }[] /* Case when classic is-multi */
                  | {
                      value: NameColor[]
                    }[] /* Case when multi and with a multiselect value */
              ) => {
                if (result) {
                  if (Array.isArray(result)) {
                    // Case when multi-select ({ value: string }[])
                    const filteredMultiSelect = (
                      result as {
                        value: NameColor[]
                      }[]
                    ).filter((item) => {
                      return Array.isArray(item.value)
                    })
                    if (filteredMultiSelect.length === 0) {
                      /* Case when classic is-multi */
                      setSelectedGroupNames((result as { value: string }[]).map(({ value }) => value))
                    } else {
                      /* Case when multi and with a multiselect value */
                      setSelectedGroupNames(filteredMultiSelect[0].value.map((groupName) => groupName.name))
                    }
                  } else {
                    /* Case when not multi */
                    setSelectedGroupNames([result.value])
                  }
                } else {
                  setSelectedGroupNames([])
                }
              }}
            />
          )}
          <PopupControls p={[3]} mt={[2]}>
            <OkButton px={[3]} onClick={() => setShowPopup(false)}>
              OK
            </OkButton>
          </PopupControls>
        </Popup>
      )}
    </Container>
  )
}

const Container = styled.div`
  ${space};
  position: relative;
`
type PopupProps = {
  show: boolean
}
const Popup = styled.div`
  ${layout};
  ${popup};
  padding: 0;
  display: ${(p: PopupProps) => (p.show ? "block" : "none")};
`
const PopupControls = styled.div`
  ${space};
  width: 100%;
  display: flex;
  justify-content: flex-end;
  position: relative;
  box-sizing: border-box;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 100%;
    transform: scaleX(1.2);
    background-color: ${(p) => p.theme.colors.lightGrey};
  }
`
const OkButton = styled.button`
  ${space};
  font: inherit;
  cursor: pointer;
  outline: inherit;
  background: ${(p) => p.theme.colors.darkBlue};
  color: white;
  text-align: center;
  border: 1px solid ${(p) => p.theme.colors.darkBlue};
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.4px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
`
const colourStyles = (theme: Theme) => ({
  menu: (provided) => ({ ...provided, position: "static", boxShadow: null }),
  container: (provided) => ({ ...provided, width: "100%", fontFamily: theme.fonts.secondary }),
  control: (provided) => ({ ...provided, margin: "8px" }),
  menuList: (provided) => ({ ...provided, height: "25vh" }),
  dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
  indicatorsContainer: (provided) => ({
    ...provided,
    backgroundColor: theme.colors.darkBlue,
    svg: { path: { fill: "white" } },
  }),
  indicatorSeparator: (provided) => ({ ...provided, display: "none" }),
  multiValue: (styles, { data }) => {
    const color = chroma(data.color)
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    }
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ":hover": {
      backgroundColor: data.color,
      color: "white",
    },
  }),
})
export default GroupNamesSelect
