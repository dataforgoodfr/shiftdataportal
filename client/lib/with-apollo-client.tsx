import Head from "next/head"
import React, { Component } from "react"
import { getDataFromTree } from "@apollo/react-ssr"
import { ApolloClient } from "apollo-client"
import { NormalizedCacheObject } from "apollo-cache-inmemory"
import initApollo from "./init-apollo"

export default (App) => {
  return class Apollo extends Component {
    static displayName = "withApollo(App)"
    static async getInitialProps(props) {
      const { AppTree } = props

      let appProps = {}
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(props)
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apollo = initApollo()
      if (typeof window === "undefined") {
        try {
          // Run all GraphQL queries
          await getDataFromTree(<AppTree {...appProps} apolloClient={apollo} />)
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          console.error("Error while running `getDataFromTree`", error)
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind()
      }

      // Extract query data from the Apollo store
      const apolloState = apollo.cache.extract()

      return {
        ...appProps,
        apolloState,
      }
    }

    constructor(props: any) {
      super(props)
      this.apolloClient = initApollo(props.apolloState)
    }
    apolloClient: ApolloClient<NormalizedCacheObject>

    render() {
      return <App apolloClient={this.apolloClient} {...this.props} />
    }
  }
}
