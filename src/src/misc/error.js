export class ErrorOptions {
  msg = "";
  handler = (params) => {};
}

class ErrorContext {
  httpResponse = null;
  error = null;
  msg = null;
  handler = null;
  showError = null;
}

class ErrorContextBuilder {
  val = new ErrorContext();

  setHttpResponse(input) {
    this.val.httpResponse = input;
    return this;
  }

  setError(input) {
    this.val.error = input;
    return this;
  }

  setMsg(input) {
    this.val.msg = input;
    return this;
  }

  setHandler(input) {
    this.val.handler = input;
    return this;
  }

  build() {
    return this.val;
  }
}

export function NewErrorContextBuilder() {
  return new ErrorContextBuilder();
}
