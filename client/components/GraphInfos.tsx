import React from "react"
import Markdown from "markdown-to-jsx"
export default function GraphInfos({ children }) {
  return (
    <Markdown
      children={children}
      options={{
        overrides: {
          h1: {
            component: "h3",
          },
          h2: { component: "h4", props: { className: "markdown" } },
          ul: { props: { className: "markdown" } },
          a: { props: { className: "markdown" } },
        },
      }}
    />
  )
}
