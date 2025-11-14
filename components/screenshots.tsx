import { Card, CardContent } from "@/components/ui/card"
import { Monitor, Smartphone, Tablet } from "lucide-react"

const screenshots = [
  {
    title: "Chat Interface",
    description: "Natural conversation with AI agents to find and match candidates",
    image: "/placeholder.jpg", // Replace with actual screenshot
    device: Monitor,
    deviceName: "Desktop"
  },
  {
    title: "Candidate Pipeline",
    description: "Visual pipeline view to track candidates through your hiring process",
    image: "/placeholder.jpg", // Replace with actual screenshot
    device: Tablet,
    deviceName: "Tablet"
  },
  {
    title: "Mobile Dashboard",
    description: "Manage your hiring on the go with our mobile-optimized interface",
    image: "/placeholder.jpg", // Replace with actual screenshot
    device: Smartphone,
    deviceName: "Mobile"
  }
]

export function Screenshots() {
  return (
    <section className="border-b border-border py-20 sm:py-32 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      {/* Section separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl text-gray-700">
            See Hazel in action
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Our platform works seamlessly across all devices, giving you the power to hire from anywhere.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-1 lg:grid-cols-3">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="group">
              <Card className="relative overflow-hidden border-2 border-border rounded-2xl bg-card shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Device Frame */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <screenshot.device className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{screenshot.deviceName}</span>
                  </div>
                  
                  {/* Screenshot Image */}
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner bg-white">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <img
                        src={screenshot.image}
                        alt={screenshot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to gradient if image doesn't exist
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center p-8">
                                <div class="text-4xl mb-4">📱</div>
                                <div class="text-sm text-muted-foreground text-center">${screenshot.title} Screenshot</div>
                                <div class="text-xs text-muted-foreground mt-2 text-center">Add your screenshot here</div>
                              </div>
                            `
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">{screenshot.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {screenshot.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Screenshot Showcase */}
        <div className="mt-16 max-w-5xl mx-auto">
          <Card className="border-2 border-border rounded-2xl overflow-hidden bg-gradient-to-br from-card to-muted/50">
            <CardContent className="p-0">
              <div className="relative">
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center">
                  <div className="text-center p-8">
                    <Monitor className="w-16 h-16 mx-auto mb-4 text-primary/40" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Full Dashboard View</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Get a complete view of your hiring pipeline, candidate matches, and AI insights all in one place.
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Add your dashboard screenshot here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

