import { useRouter } from "next/router"
import { useEffect, useCallback } from "react"
import { ParsedUrlQueryInput } from "querystring"
const useSyncParamsWithUrl = (params: ParsedUrlQueryInput) => {
  const router = useRouter()
  const routerReplace = useCallback(router.replace, [])
  useEffect(() => {
    const urlObject = {
      pathname: router.pathname,
      query: params,
    }
    routerReplace(urlObject, urlObject, { shallow: true })
  }, [params, routerReplace, router.pathname])
}
export default useSyncParamsWithUrl
