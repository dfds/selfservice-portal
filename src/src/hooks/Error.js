import { useContext, useState } from "react";
import ErrorContext from "ErrorContext";

export function useError(opts) {
  const [options, setOptions] = useState(opts);
  const { showError } =  useContext(ErrorContext);

  const triggerError = (params) => {
      if (options) {
          if (options.handler) {
              options.handler(params);
          } else {
              if (params) {
                  params.showError = showError;

                  if (params.handler) {
                      params.handler(params);
                      return;
                  }

                  if (params.error) {
                      showError(params.error.message);
                      return;
                  }

                  if (params.msg) {
                      showError(params.msg);
                      return;
                  }

                  showError(options.msg);
              } else {
                  showError(options.msg);
              }
          }
      }
  }

  return {
    options,
    setErrorOptions: setOptions,
    triggerError
  }
}