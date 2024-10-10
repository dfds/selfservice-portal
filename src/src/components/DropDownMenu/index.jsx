import React from "react";
import style from "./dropdownmenu.module.css";

export default function DropDownInvitationsMenu({
  items,
  addInviteeFromDropDown,
}) {
  return (
    <>
      <div>
        <div className={style.items}>
          {(items || []).map((item) => (
            <div
              key={item.id}
              className={style.item}
              onClick={() => addInviteeFromDropDown(item.mail)}
            >
              {item.displayName} {item.mail}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
