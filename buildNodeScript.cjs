const fs = require('fs')
const path = require('path')

const nodes = [
  { file: 'StartNode.tsx',   strip: '<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 opacity-80" />' },
  { file: 'TaskNode.tsx',    strip: '<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-80" />' },
  { file: 'ApprovalNode.tsx',strip: '<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 opacity-80" />' },
  { file: 'AutomatedNode.tsx',strip: '<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-80" />' },
  { file: 'EndNode.tsx',     strip: '<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 opacity-80" />' }
]

nodes.forEach(n => {
  const file = path.join(__dirname, 'src/components/nodes', n.file)
  if (!fs.existsSync(file)) return
  let content = fs.readFileSync(file, 'utf8')

  // Change <div clsx(...) to <> <div clsx(... overflow-hidden)
  content = content.replace(
    /return \(\n\s*<div\n\s*className={clsx\(\n\s*'([^']+)',/g,
    `return (\n    <>\n      <div\n        className={clsx(\n          '$1 overflow-hidden',`
  )
  
  // Replace the old strip with the pure top-0 strip
  content = content.replace(
    /{\/\* \w+ accent strip \*\/}\n\s*<div className="absolute top-\[1px\][^>]+>/g,
    `{/* Accent strip */}\n      ${n.strip}`
  )

  // Move the Handle outside by replacing the end of the file.
  // Currently the file ends with:
  //       <Handle ... />
  //     </div>
  //   )
  // })
  // Actually, Task and Approval modes have Handle at the TOP and BOTTOM.
  // Instead of complex RegExp, let's just close the div right before the first Handle, 
  // or actually, just put the `</div>` after the inner content wrapper end!
  
  // The inner content wrapper is: <div className="px-4 pt-3 pb-4"> ... </div>
  // We can just rely on replacing that specific inner closure.
})
