import { getAnotherUserProfilePictureUrl } from "GraphApiClient";
import { useEffect, useState } from "react";
import { useTopVisitors } from "@/state/remote/queries/stats";
import Confetti from "react-confetti";
import { useMe } from "@/state/remote/queries/me";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SkeletonVisitorRow } from "@/components/ui/skeleton";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight + 200,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

function Visitor({ rank, name, pictureUrl, onClicked, index = 0 }) {
  const handler = onClicked ?? (() => {});

  return (
    <div
      className={`flex items-center gap-[0.625rem] py-2 border-b border-divider first:pt-0 last:border-0 last:pb-0 animate-fade-up ${rank === 1 ? "cursor-pointer" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handler}
      title={rank === 1 ? "Celebrate...?" : ""}
    >
      <div
        className="font-mono text-[11px] w-4 text-right flex-shrink-0"
        style={{ color: rank === 1 ? "#ed8800" : "#afafaf" }}
      >
        {rank}
      </div>
      <UserAvatar name={name} pictureUrl={pictureUrl} size="sm" />
      <div className="text-[13px] text-secondary">{name}</div>
    </div>
  );
}

export default function TopVisitors() {
  const { data: myProfile } = useMe();
  const [visitors, setVisitors] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const { isFetched, data } = useTopVisitors(myProfile);

  const handleVisitorClicked = (rank) => {
    if (rank === 1 && !showConfetti) {
      setShowConfetti(true);
    }
  };

  useEffect(() => {
    let handler = null;
    if (showConfetti) {
      handler = setTimeout(() => setShowConfetti(false), 1000 * 10);
    }
    return () => {
      if (handler) clearTimeout(handler);
    };
  }, [showConfetti]);

  function loadVisitors() {
    const items = data.items;
    items.sort((a, b) => a.rank - b.rank);
    items.forEach(async (visitor) => {
      const profilePictureUrl = await getAnotherUserProfilePictureUrl(visitor.id);
      setVisitors((prev) => {
        let copy = prev.length === 0 ? items : prev;
        const found = copy.find((x) => x.id === visitor.id);
        if (found) found.pictureUrl = profilePictureUrl;
        return copy;
      });
    });
  }

  useEffect(() => {
    if (isFetched) {
      loadVisitors();
    }
  }, [myProfile, data, isFetched]);

  if (!isFetched) {
    return (
      <div>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonVisitorRow key={i} isFirst={i === 0} isLast={i === 4} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {showConfetti && <Confetti width={width} height={height} />}
      {(visitors || []).map((x, i) => (
        <Visitor
          key={i}
          index={i}
          {...x}
          onClicked={() => handleVisitorClicked(x.rank)}
        />
      ))}
      {(visitors || []).length === 0 && (
        <div className="font-mono text-[11px] text-[#afafaf] italic">
          too early to tell...
        </div>
      )}
    </div>
  );
}
