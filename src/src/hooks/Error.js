import { useContext, useState } from "react";
import ErrorContext from "ErrorContext";

export function useError(opts) {
  const [options, setOptions] = useState(opts);
  const { showError } = useContext(ErrorContext);

  ///
  /// triggerError
  ///
  /// Priority of error handling flow
  ///   1: Handler provided via params
  ///   2: Handler provided via options
  ///   3: Error provided via params
  ///   4: title provided via params
  ///   5: fallbacktitle
  ///
  const triggerError = (params) => {
    // Setup
    let fallbackTitle = "error";
    if (params) {
      params.showError = showError;
    }

    if (options?.title != null) {
      fallbackTitle = options.title; // If a catch-all error message is available in options, make sure it is used as a fallback
    }

    // Error handling flow
    if (params?.handler != null) {
      // 1: Handler provided via params
      params.handler(params);
      return;
    }

    if (options?.handler != null) {
      // 2: Handler provided via options
      if (params.title === null) {
        params.title = fallbackTitle;
      }
      options.handler(params);
      return;
    }

    if (params) {
      if (params.error) {
        // 3: Error provided via params
        showError(params.error.message, params.details);
        return;
      }

      if (params.title) {
        // 4: title provided via params
        showError(params.title, params.details);
        return;
      }
    }

    showError(fallbackTitle, params.httpResponse); // 5: fallbacktitle
  };

  const triggerErrorWithTitleAndDetails = (errorTitle, errorDetails) => {
    showError(errorTitle, errorDetails);
  };

  return {
    options,
    setErrorOptions: setOptions,
    triggerErrorWithTitleAndDetails,
    triggerError,
  };
}
