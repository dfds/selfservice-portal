import { useContext, useState } from "react";
import ErrorContext from "ErrorContext";

export function useError(opts) {
  const [options, setOptions] = useState(opts);
  const { showError } = useContext(ErrorContext);

  const triggerErrorWithTitleAndDetails = (errorTitle, errorDetails) => {
    showError(errorTitle, errorDetails);
  };

  return {
    options,
    setErrorOptions: setOptions,
    triggerErrorWithTitleAndDetails,
  };
}
