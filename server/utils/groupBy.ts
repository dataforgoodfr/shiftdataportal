const groupBy = (array: any, key: string) => {
  return array.reduce(function (stock, nextValue) {
    (stock[nextValue[key]] = stock[nextValue[key]] || []).push(nextValue);
    return stock;
  }, {});
};

export default groupBy;
