type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
export default function Input({ label, id, className = '', ...props }: Props) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm text-gray-300">{label}</label>}
      <input id={id} className={`mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-primary ${className}`} {...props} />
    </div>
  )
}

