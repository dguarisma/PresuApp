import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonLoaderProps {
  type?: "card" | "list" | "detail" | "chart"
}

export function SkeletonLoader({ type = "card" }: SkeletonLoaderProps) {
  switch (type) {
    case "list":
      return (
        <div className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
        </div>
      )

    case "detail":
      return (
        <div className="space-y-5">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      )

    case "chart":
      return (
        <div className="space-y-5">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
      )

    case "card":
    default:
      return (
        <div className="space-y-3">
          <Skeleton className="h-[125px] w-full rounded-lg" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      )
  }
}
