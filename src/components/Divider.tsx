import { FC } from "react";

type DividerProps = {
  variant?: "light" | "dark";
};

const Divider: FC<DividerProps> = ({ variant = "light" }) => (
  <hr className={`w-full border-t ${variant === "dark" ? "border-gray-700" : "border-gray-200"}`} />
);

export default Divider;
