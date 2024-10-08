import { useQuery } from "@tanstack/react-query";
import { msGraphRequest, ssuRequest } from "../query";
import { useEffect, useState } from "react";

const sortByName = (list) => {
  list.sort((a, b) => a.name.localeCompare(b.name));
};

export function useCapabilities() {
  const query = useQuery({
    queryKey: ["capabilities"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    select: (data: any) => {
      let list = data.items || [];
      sortByName(list);
      return list;
    },
  });

  return query;
}

export function useCapability(id: string) {
  const query = useQuery({
    queryKey: ["capabilities", id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", id],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return query;
}

export function useCapabilityMembersDetailed(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.members;

  const query = useQuery({
    queryKey: ["capability-members-detailed", capabilityDefinition?.id],
    queryFn: async () => {
      const membersResp = await ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: true,
      });

      let resps = await Promise.all(
        membersResp.items.map(async (member) => {
          let resp = await msGraphRequest({
            method: "GET",
            url: `https://graph.microsoft.com/v1.0/users/${member.email}/photos/96x96/$value`,
            payload: null,
          });

          if (!resp.ok) {
            return { ...member, pictureUrl: "" };
          } else {
            const blob = await resp.blob();
            const url = window.URL || window.webkitURL;
            return { ...member, pictureUrl: url.createObjectURL(blob) };
          }
        }),
      );

      return resps;
    },
    enabled: !!link,
  });

  return query;
}

export function useCapabilityMembersApplications(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.membershipApplications;

  const query = useQuery({
    queryKey: ["capability-membership-applications", capabilityDefinition?.id],
    queryFn: async () => {
      const membersResp = await ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: true,
      });

      let resps = await Promise.all(
        membersResp.items.map(async (member) => {
          let resp = await msGraphRequest({
            method: "GET",
            url: `https://graph.microsoft.com/v1.0/users/${member.email}/photos/96x96/$value`,
            payload: null,
          });

          if (!resp.ok) {
            return { ...member, applicantProfilePictureUrl: "" };
          } else {
            const blob = await resp.blob();
            const url = window.URL || window.webkitURL;
            return {
              ...member,
              applicantProfilePictureUrl: url.createObjectURL(blob),
            };
          }
        }),
      );

      return resps;
    },
    enabled: !!link,
  });

  return query;
}

export function useCapabilityMembers(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.members;

  const query = useQuery({
    queryKey: ["capability-members", capabilityDefinition?.id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!link,
  });

  return query;
}

export function useUserProfilePicture(upn: string) {
  const query = useQuery({
    queryKey: [`user-profilepicture.${upn}`],
    queryFn: async () =>
      msGraphRequest({
        method: "GET",
        url: `https://graph.microsoft.com/v1.0/users/${upn}/photos/96x96/$value`,
        payload: null,
      }),
  });

  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    if (!query.data.ok) {
      setProfilePicture("");
    } else {
      query.data.blob().then((data) => {
        const url = window.URL || window.webkitURL;
        setProfilePicture(url.createObjectURL(data));
      });
    }
  }, [query.isFetched]);

  return { ...query, profilePicture };
}
