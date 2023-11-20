import React from "react";
import style from "./dropdownmenu.module.css";

export default function DropDownInvitationsMenu({
  items,
  setIsUserSearchActive,
  setInvitationsInput,
}) {
  const handleItemClick = (email) => {
    setIsUserSearchActive(false);
    setInvitationsInput(email);
  };

  return (
    <>
      <div>
        <div className={style.items}>
          {(items || []).map((item) => (
            <div
              key={item.id}
              className={style.item}
              onClick={() => handleItemClick(item.mail)}
            >
              {item.displayName} {item.mail}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
