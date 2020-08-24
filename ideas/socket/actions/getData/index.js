const axios = require('axios');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    // Let's now check this data type.
    if (data.type == "organizationsList") {
      // (using Axios for caching)
      axios.get('https://api.ideas.wavees.ml/v1/organizations', { headers: {
        "Authorization": `Bearer ${data.token}`
      }})
      .then((response) => {
        let data = response.data;

        resolve({ dataType: "organizationsList", response: data });
      }).catch(() => {
        resolve({ dataType: "organizationsList", error: error.response.data });
      });
    };
  });
};