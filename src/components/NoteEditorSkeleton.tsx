import { Skeleton } from "@/components/ui/skeleton"

export function NoteEditorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title Section Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4 rounded" /> {/* Label */} 
        <Skeleton className="h-12 w-full rounded" /> {/* Input */} 
      </div>
      
      {/* Content Section Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4 rounded" /> {/* Label */} 
        {/* Recording Controls Placeholder */}
        <div className="flex items-center space-x-3 h-9 mb-2">
           <Skeleton className="h-9 w-9 rounded-md" /> {/* Button */} 
           <Skeleton className="h-4 w-24 rounded" /> {/* Hint Text */} 
        </div>
        {/* Text Area Skeleton */}
        <Skeleton className="h-60 w-full rounded-md" /> {/* Approximate height for rows={15} */} 
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex justify-start items-center space-x-3 pt-2">
        <Skeleton className="h-12 w-32 rounded-md" /> {/* Save Button */} 
        <Skeleton className="h-12 w-24 rounded-md" /> {/* Cancel Button */} 
      </div>
    </div>
  )
} 