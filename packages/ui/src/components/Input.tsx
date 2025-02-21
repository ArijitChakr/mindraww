interface InputProps {
  className?: string;
  placeholder?: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

const Input = ({
  value,
  className,
  placeholder,
  type,
  onChange,
}: InputProps) => {
  return (
    <input
      onChange={onChange}
      value={value}
      className={`${className ? className : ""} border-2 border-slate-400 rounded-md p-2 text-black`}
      placeholder={placeholder}
      type={type ? type : "text"}
    />
  );
};

export default Input;
