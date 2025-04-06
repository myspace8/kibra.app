export function CardsSkeleton() {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="divide-y divide-gray-200">
            <div className="flex gap-4 p-4 animate-pulse">
              <div className="w-[70px] h-[100px] bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }