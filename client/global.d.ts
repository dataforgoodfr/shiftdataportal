declare module "*.png"
declare module "*.svg"

declare namespace NodeJS {
  interface Process {
    browser: boolean
  }
  interface Global {
    fetch: any
  }
}
