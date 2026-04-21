import clsx from 'clsx'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (val: string) => void
  options: SelectOption[]
  error?: string
  disabled?: boolean
}

export function Select({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs uppercase tracking-wide text-gray-400 font-medium">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-150',
          'appearance-none cursor-pointer',
          error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-800">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
