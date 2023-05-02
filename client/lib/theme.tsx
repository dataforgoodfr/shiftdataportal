const fontSizes = [
  "0.575rem", // 0 8px
  "0.625rem", // 1 10px
  "0.75rem", // 2 12px
  "0.875rem", // 3 14px
  "1rem", // 4 16px
  "1.125rem", // 5 18px
  "1.25rem", // 6 20px
  "1.5rem", // 7 24px
  "1.875rem", // 8 30px
  "2rem", // 9 32px
  "3rem", // 10 48px
  "4rem", // 11 64px
]
const space = [
  // margin and padding
  0, // 0
  4, // 1
  8, // 2
  16, // 3
  32, // 4
  64, // 5
  128, // 6
  256, // 7
  512, // 8
]
const sizes = [
  0, // 0
  4, // 1
  8, // 2
  16, // 3
  32, // 4
  64, // 5
  128, // 6
  256, // 7
  512, // 8
]
const mainPaddingX = [3, 5, 5, 5, 6]
const colors = {
  blue: "#265990",
  darkBlue: "#313D6F",
  orange: "#DD6D2D",
  darkOrange: "#c74900",
  green: "#6D893C",
  darkWhite: "#FAFAFA",
  lightBlack: "#292929",
  lightGrey: "#D9D9D9",
  grey: "#484848",
  backgroundColor: "#F8F8F8",
}
const fonts = {
  primary: "'IBM Plex Sans', sans-serif",
  secondary: "'IBM Plex Mono', monospace",
}
const breakpoints: any = ["40em", "52em", "64em", "80em"]

// aliases
breakpoints.sm = breakpoints[0]
breakpoints.md = breakpoints[1]
breakpoints.lg = breakpoints[2]
breakpoints.xl = breakpoints[3]

export default { fontSizes, space, colors, breakpoints, mainPaddingX, sizes, fonts }
