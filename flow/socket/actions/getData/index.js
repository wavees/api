const getOrganizations = require('../../../actions/organizations/getList');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    // Let's now check this data type.
    if (data.type == "organizationsList") {
      // (using Axios for caching)
      getOrganizations(data.token)
      .then((response) => {
        resolve({ dataType: "organizationsList", response });
      }).catch((error) => {
        resolve({ dataType: "organizationsList", error: error.response.data });
      });
    };
  });
};