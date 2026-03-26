import { useState } from "react";
import { HexColorPicker } from "react-colorful";

export default function ColorPicker({value, onChange}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        className="w-[40px] h-[40px] p-[6px] cursor-pointer"
        style={{
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#FFFFFF"
        }}
        onClick={() => setOpen(!open)}
        >
        <div
            className="w-full h-full border border-solid border-black"
            style={{ background: value}}
        />
       </div>
        {open && (
            <div style={{ position: "absolute", zIndex: 100 }} className="right-0 top-[120%]">
            <HexColorPicker color={value} onChange={(newColor) => {
                onChange(newColor);
            }} />
            </div>
        )}
    </div>
  );
}