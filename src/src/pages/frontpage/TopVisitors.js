import AppContext from "AppContext";
import { SmallProfilePicture } from "components/ProfilePicture";
import { getAnotherUserProfilePictureUrl } from "GraphApiClient";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react"
import { getTopVisitors } from "SelfServiceApiClient";

import Confetti from 'react-confetti';

import styles from "./TopVisitors.module.css";
import { Text } from "@dfds-ui/typography";

function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
    useEffect(() => {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight + 200,
        });
      }
      // Add event listener
      window.addEventListener("resize", handleResize);
      // Call handler right away so state gets updated with initial window size
      handleResize();
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
}

function Visitor({rank, name, pictureUrl, onClicked}) {
    const handler = onClicked ?? (() => {});
    return <div className={`${styles.visitor} ${rank === 1 ? styles.leader : "" }`} onClick={handler}>
        <div className={styles.profilepicture}>
            <SmallProfilePicture name={name} pictureUrl={pictureUrl} />
        </div>
        <div className={styles.information}>
            {name}
        </div>
    </div>
}

export default function TopVisitors() {
    const { myProfile } = useContext(AppContext);
    const [visitors, setVisitors] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize()

    const handleVisitorClicked = (rank) => {
        if (rank === 1 && !showConfetti) {
            setShowConfetti(true);
        }
    }

    useEffect(() => {
        let handler = null;
        if (showConfetti) {
            handler = setTimeout(() => setShowConfetti(false), 1000 * 10);
        }
        return () => {
            if (handler) {
                clearTimeout(handler);
            }
        }
    }, [showConfetti]);

    const loadVisitors = useCallback(async () => {
        const link = myProfile?._links?.topVisitors;
        if (!link) {
            return;
        }

        const items = await getTopVisitors(myProfile);
        items.sort((a,b) => a.rank - b.rank);

        setVisitors(items);

        items.forEach(async visitor => {
            const profilePictureUrl = await getAnotherUserProfilePictureUrl(visitor.id);
            setVisitors(prev => {
              const copy = prev
                  ? [...prev]
                  : [];
  
              const found = copy.find(x => x.id === visitor.id)
              if (found) {
                  found.pictureUrl = profilePictureUrl;
              }
  
              return copy;
            });
          });
    }, [myProfile]);

    useEffect(() => {
        loadVisitors();
    }, [myProfile]);

    return <div>
        {showConfetti && <Confetti width={width} height={height} />}
        {(visitors || []).map((x, i) => <Visitor 
            key={i} 
            {...x} 
            onClicked={() => handleVisitorClicked(x.rank)}
        />)}
        
        {(visitors || []).length === 0 &&
            <div className={styles.tooearly}>too early to tell...</div>            
        }
    </div>
}