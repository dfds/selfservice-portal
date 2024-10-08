import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { useSelector } from "react-redux";

// export function useProfile(user) {
//   const { responseData, sendRequest } = useSelfServiceRequest();
//   const [isLoadedProfile, setIsLoadedProfile] = useState(false);
//   const [profileInfo, setProfileInfo] = useState(null);
//   const [triggerReload, setTriggerReload] = useState(false);
//   const validAuthSession = useSelector((s) => s.auth.isSessionActive);

//   const reload = () => {
//     setTriggerReload(!triggerReload);
//   };

//   useEffect(() => {
//     if (validAuthSession) {
//       sendRequest({
//         urlSegments: ["me"],
//       });
//     }
//   }, [user, triggerReload, validAuthSession]);

//   useEffect(() => {
//     if (responseData !== null) {
//       setProfileInfo(responseData);
//     }
//   }, [responseData]);

//   useEffect(() => {
//     if (profileInfo !== null) {
//       setIsLoadedProfile(true);
//     }
//   }, [profileInfo]);

//   return {
//     isLoadedProfile,
//     profileInfo,
//     reload,
//   };
// }
