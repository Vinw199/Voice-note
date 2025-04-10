import { Skeleton } from "@/components/ui/skeleton"

export function NoteListItemSkeleton() {
  return (
    <div className="flex items-center border rounded-lg bg-card p-4 shadow-sm">
      {/* Mimic Link area */}
      <div className="flex-1 min-w-0">
        {/* Title and Date row */}
        <div className="flex justify-between items-start mb-2 gap-2">
            <Skeleton className="h-5 w-3/5 rounded" /> {/* Title */} 
            <Skeleton className="h-4 w-1/4 rounded" /> {/* Date */} 
        </div>
        {/* Content Snippet rows */}
        <div className="space-y-1.5">
            <Skeleton className="h-4 w-full rounded" /> 
            <Skeleton className="h-4 w-5/6 rounded" /> 
        </div>
      </div>
      {/* Delete Button placeholder */} 
      <div className="p-2 pl-1 border-l ml-2 flex-shrink-0"> 
          <Skeleton className="h-8 w-8 rounded" /> 
      </div>
    </div>
  )
} 