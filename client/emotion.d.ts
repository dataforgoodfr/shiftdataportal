import "@emotion/react"

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      blue: string
      darkBlue: string
      brandeisBlue: string
      orange: string
      lightOrange: string
      darkOrange: string
      yellow: string
      sandYellow: string
      cyan: string
      freshBlue: string
      green: string
      darkWhite: string
      lightGrey: string
    }
    fonts: {
      primary: string
      secondary: string
    }
    space: number[]
    fontSizes: string[]
  }
}
