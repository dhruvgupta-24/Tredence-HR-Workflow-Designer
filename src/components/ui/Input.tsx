import clsx from 'clsx'

interface InputProps {
  label?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled = false,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs uppercase tracking-wide text-gray-400 font-medium">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-150',
          error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
