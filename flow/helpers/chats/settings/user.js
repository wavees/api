module.exports = (uid, cid) => {
  return new Promise((resolve, reject) => {
    resolve({
      size: 1,
      background: "bg-blue-600",

      position: Math.floor(Math.random() * Math.floor(10))
    });
  });
};