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
    ///   4: Msg provided via params
    ///   5: fallbackMsg
    ///
    const triggerError = (params) => {
        // Setup
        let fallbackMsg = "error";
        if (params) {
            params.showError = showError;
        }

        if (options?.msg != null) {
            fallbackMsg = options.msg; // If a catch-all error message is available in options, make sure it is used as a fallback
        }

        // Error handling flow
        if (params?.handler != null) { // 1: Handler provided via params
            params.handler(params);
            return;
        }

        if (options?.handler != null) { // 2: Handler provided via options
            if (params.msg === null) {
                params.msg = fallbackMsg;
            }
            options.handler(params);
            return;
        }

        if (params) {
            if (params.error) { // 3: Error provided via params
                showError(params.error.message);
                return;
            }

            if (params.msg) { // 4: Msg provided via params
                showError(params.msg);
                return;
            }
        }

        showError(fallbackMsg); // 5: fallbackMsg
    }

    return {
        options,
        setErrorOptions: setOptions,
        triggerError
    }
}