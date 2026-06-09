import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { ssuRequest } from "@/state/remote/query";
import PreAppContext from "@/preAppContext";

export function useAwsAccount(capabilityDefinition: any) {
    const link = capabilityDefinition?._links?.awsAccount;
    const { isCloudEngineerEnabled } = useContext(PreAppContext);

    const query = useQuery({
        queryKey: ["capabilities", "aws-account", capabilityDefinition?.id],
        queryFn: async () =>
            ssuRequest({
                method: "GET",
                urlSegments: [link.href],
                payload: null,
                isCloudEngineerEnabled: isCloudEngineerEnabled,
            }),
        enabled: link?.href != null,
    });

    return query;
}

export function useAwsAccountInformation(capabilityDefinition: any) {
    const link = capabilityDefinition?._links?.awsAccountInformation;
    const { isCloudEngineerEnabled } = useContext(PreAppContext);

    const query = useQuery({
        queryKey: ["capabilities", "aws-account-information", capabilityDefinition?.id],
        queryFn: async () =>
            ssuRequest({
                method: "GET",
                urlSegments: [link.href],
                payload: null,
                isCloudEngineerEnabled: isCloudEngineerEnabled,
            }),
        enabled: link?.href != null,
    });

    return query;
}
