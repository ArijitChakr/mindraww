"use client";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const buttonVariants = {
  primary: "bg-purple-700 text-white hover:bg-blue-500",
  secondary: "bg-slate-400 text-white hover:bg-slate-700",
  outline:
    "bg-slate-200 border border-slate-400 hover:bg-slate-400  text-slate-700",
};

const buttonSizes = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-md",
  lg: "px-6 py-2 text-lg",
  default: "m-2 rounded-md",
};

const Button = ({
  children,
  className,
  onClick,
  variant,
  size,
  disabled,
}: ButtonProps) => {
  return (
    <button
      className={`${className ? className : ""} ${size ? buttonSizes[size] : ""} ${buttonVariants[variant]} ${buttonSizes.default}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
