interface Pair {
  key: string
  value: string
}

interface KeyValueEditorProps {
  pairs: Pair[]
  onChange: (pairs: Pair[]) => void
}

const inputCls =
  'flex-1 min-w-0 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors hover:border-gray-600'

export function KeyValueEditor({ pairs, onChange }: KeyValueEditorProps) {
  const addRow = () => onChange([...pairs, { key: '', value: '' }])

  const updateRow = (index: number, field: keyof Pair, val: string) => {
    onChange(pairs.map((p, i) => (i === index ? { ...p, [field]: val } : p)))
  }

  const removeRow = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={pair.key}
            onChange={(e) => updateRow(i, 'key', e.target.value)}
            placeholder="Key"
            className={inputCls}
          />
          <input
            value={pair.value}
            onChange={(e) => updateRow(i, 'value', e.target.value)}
            placeholder="Value"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="flex-shrink-0 text-gray-600 hover:text-red-400 transition-colors px-1 text-sm leading-none"
            aria-label="Remove row"
          >
            x
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        + Add row
      </button>
    </div>
  )
}
