export default function CampaignsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex items-center space-x-4">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>
                <div className="text-center">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
