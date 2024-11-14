// HomePage.jsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/app/ui/card"
import { Textarea } from "@/app/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/dialog"
import { useState } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">HR Cloud</h1>
              <div className="hidden md:flex space-x-4">
                <a href="#features" className="text-muted-foreground hover:text-primary">Features</a>
                <a href="#solutions" className="text-muted-foreground hover:text-primary">Solutions</a>
                <a href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</a>
              </div>
            </div>
            <div className="hidden md:block">
              <Button>Get Started</Button>
            </div>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-2">
              <a href="#features" className="block text-muted-foreground hover:text-primary">Features</a>
              <a href="#solutions" className="block text-muted-foreground hover:text-primary">Solutions</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-primary">Pricing</a>
              <Button className="w-full mt-2">Get Started</Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
          Transform Your HR Management
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your HR processes with our all-in-one platform. From recruitment to performance management, we've got you covered.
        </p>
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg">Request a Quote</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Get a Custom Quote</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <Input placeholder="Company Name" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="Number of Employees" type="number" />
                <Textarea placeholder="Tell us about your needs" />
                <Button type="submit" className="w-full">Submit Request</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold">98%</h3>
            <p className="text-muted-foreground mt-2">Customer Satisfaction</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">50K+</h3>
            <p className="text-muted-foreground mt-2">Users Worldwide</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold">24/7</h3>
            <p className="text-muted-foreground mt-2">Customer Support</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your HR?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of companies already using our platform</p>
          <Button size="lg" variant="secondary">Start Free Trial</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 HR Cloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Recruitment & Onboarding",
    description: "Streamline your hiring process with automated workflows and paperless onboarding.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    title: "Performance Management",
    description: "Set goals, track progress, and conduct reviews with our intuitive tools.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10"></path>
        <path d="M18 20V4"></path>
        <path d="M6 20v-4"></path>
      </svg>
    ),
  },
  {
    title: "Payroll & Benefits",
    description: "Manage compensation and benefits with automated calculations and reporting.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
        <path d="M12 18V6"></path>
      </svg>
    ),
  },
]