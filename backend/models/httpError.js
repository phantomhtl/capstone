// Helper model to handle error. It basically catches error in try catch syntax and pass error to Showerror modal in frontend

class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
  }
}

module.exports = HttpError;
