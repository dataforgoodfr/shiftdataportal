const syncUrlState = (
  params: { [key: string]: any },
  pathname: string
): Promise<string> =>
  new Promise(resolve => {
    const paramsUrlEncoded = Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
    resolve(`${pathname}?${paramsUrlEncoded}`);
  });
export default syncUrlState;
