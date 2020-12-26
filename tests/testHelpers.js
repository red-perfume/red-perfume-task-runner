const testHelpers = {
  /**
   * The errno value from a failed fs read/write is a different
   * value on different OS's. Since we don't care about the type
   * of error (since we are force it to occur for the sake of the
   * test) we just remove it from the object, so each OS can
   * correctly validate and pass the test.
   *
   * @param  {Error}  err  An Error object, or an array of Error objects
   * @return {object}      Just a plain object, with errno removed
   */
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
