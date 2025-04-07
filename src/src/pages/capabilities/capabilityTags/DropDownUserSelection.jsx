import React from "react";
import style from "./dropdownmenu.module.css";

export default function DropDownUserSelection({ items, addUserFromDropDown }) {
  const handleUserClicked = (user) => {
    addUserFromDropDown(user.email);
  };

  return (
    <>
      <div>
        <div className={style.items}>
          {(items || []).map((item) => (
            <div
              key={item.id}
              className={style.item}
              onClick={() => handleUserClicked(item)}
            >
              {item.name}
              {" ("}
              {item.email}
              {")"}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
