import React, { Fragment } from "react"
export default function Contact() {
  return (
    <Fragment>
      <h1>Contact page</h1>
      <form>
        Name:
        <br />
        <input type="text" name="name" />
        <br />
        Email:
        <br />
        <input type="email" name="email" />
        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>
    </Fragment>
  )
}
