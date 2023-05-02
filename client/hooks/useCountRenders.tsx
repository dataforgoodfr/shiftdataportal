import { useRef } from "react"

export default function useCountRenders(name: string) {
  const renders = useRef(0)
  console.log(`renders: ${name}`, renders.current++)
}
