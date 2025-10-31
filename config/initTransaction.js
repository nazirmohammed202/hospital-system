const mongoose = require("mongoose");

// This function is responsible for initializing a transaction, a two-phase commit operation. It allows you to perform multiple operations on the database and commit them all at once, or rollback all of them if an error occurs.
module.exports.initTransaction = function (transact) {
  return new Promise((resolve, reject) => {
    (async () => {
      const transaction = await mongoose.startSession();
      transaction.startTransaction();
      try {
        await transact(transaction);
        await transaction.commitTransaction();
        resolve(true);
      } catch (ex) {
        await transaction.abortTransaction();
        reject(ex);
      } finally {
        transaction.endSession();
      }
    })();
  });
};
