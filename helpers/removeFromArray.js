module.exports = (array, element) => {
  let newArray = array.filter(el => el != element);

  return newArray;
}