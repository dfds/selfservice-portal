import React, { useState, useMemo, useEffect, useContext, useRef } from "react";
import { SimpleEditor } from "./simple-editor";

export default function Editor() {
  const [value, setValue] = useState("");

  return (
    <>
      <div className="editor-primary">
        <SimpleEditor />
      </div>
    </>
  );
}
