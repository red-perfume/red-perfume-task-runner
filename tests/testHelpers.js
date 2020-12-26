const testHelpers = {
  removeErrno: function (err) {
    err = JSON.parse(JSON.stringify(err));
    if (!err.errno && Array.isArray(err) && err.length && err[0].errno) {
      err = err[0];
    }
    delete err.errno;
    return err;
  }
};

module.exports = testHelpers;
