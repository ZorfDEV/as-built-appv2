//import React from 'react'

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex h-8 w-8 items-center justify-center
          rounded-lg bg-emerald-500/10
          text-emerald-400
        "
      >
        {icon}
      </div>

      <h2 className="font-semibold text-axblue-2 dark:text-white/80">
        {title}
      </h2>
    </div>
  )
}

export default SectionTitle