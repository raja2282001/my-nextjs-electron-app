"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { CartSlider } from "../commencompoent/cart-sidebar"


export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCartOpen, setIsCartOpen] = useState(false) // slider open state

  if (pathname === "/login" || pathname === "/") {
    return null
  }

  const handlelogout = () => {
    localStorage.removeItem("ecommerce_token")
    localStorage.removeItem("ecommerce_user")
    router.push("/login")
  }

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">ModernStore</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Products
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Categories
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {/* Profile */}
            <button
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => router.push("/profile")}
              aria-label="Profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {/* Logout */}
            <button
              className="text-muted-foreground hover:text-red-500 transition-colors"
              onClick={handlelogout}
              aria-label="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                />
              </svg>
            </button>

            {/* Cart trigger (last button) */}
            <button
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsCartOpen(true)} // open the slider
              aria-label="Open cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19m-12 0a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <CartSlider open={isCartOpen} setIsCartOpen={setIsCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
