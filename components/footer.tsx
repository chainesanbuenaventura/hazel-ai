export function Footer() {
    return (
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-lg font-bold text-primary-foreground">H</span>
                </div>
                <span className="text-xl font-semibold">Hazel AI</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Connecting startups with exceptional talent since 2024.
              </p>
            </div>
  
            <div>
              <h3 className="font-semibold">For Startups</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Post a job
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Browse talent
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
  
            <div>
              <h3 className="font-semibold">For Talent</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Find jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Create profile
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Resources
                  </a>
                </li>
              </ul>
            </div>
  
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
  
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Hazel AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }
  