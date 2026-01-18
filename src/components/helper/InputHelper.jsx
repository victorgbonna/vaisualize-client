import { useState } from "react";

export default function InputHelper({
  label,
  showLabel,
  textClassName = "",
  className = "",
  type = "text",
  onChange,
  value = "",
  extraText,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`w-full`}>
      {showLabel ? (
        <p className="text-[15px] mb-2">
          {label}
        </p>
      ) : null}

      <div
        style={showLabel ? { padding: 8 } : {}}
        className={`relative w-full flex flex-row items-center justify-between border bg-white rounded-md py-1 ${className}`}
      >
        <input
          value={value || ''}
          onChange={(e) => onChange(e)}
          placeholder={label}
          className={`text-[15px] text-black flex-1 w-full ${textClassName}`}
          type={type === "password" && !showPassword ? "password" : "text"}
          {...rest}
        />

        {type === "password" ? (
          <button
            className="min-w-fit flex items-center"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img
              className="w-4 h-4"
              src={showPassword ? "/svg/eye-closed.svg" : "/svg/eye.svg"}
            />
          </button>
        ) : null}
      </div>
      {extraText?<p className="text-gray-600 text-sm mt-2">{extraText}</p>:null}
    </div>
  );
}
