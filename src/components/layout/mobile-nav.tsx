"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { isAuthenticated, user } = useAuthStore()

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 top-16 z-50 bg-white">
          <nav className="container px-4 py-6 flex flex-col gap-4" role="navigation" aria-label="Mobile navigation">
            <Link
              href="/menu"
              onClick={() => setOpen(false)}
              className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
            >
              Menu
            </Link>

            {isAuthenticated && user?.role === "customer" && (
              <>
                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Profile
                </Link>
              </>
            )}

            {(isAuthenticated && (user?.role === "admin" || user?.role === "superadmin")) && (
              <>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/zones"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Service Zones
                </Link>
                <Link
                  href="/admin/menu-management"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Menu Management
                </Link>
                <Link
                  href="/admin/orders-management"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Orders Management
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === "seller" && (
              <>
                <Link
                  href="/seller/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Seller Dashboard
                </Link>
                <Link
                  href="/seller/zones"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Manage Zones
                </Link>
                <Link
                  href="/seller/menu"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-2 py-2 min-h-[44px] flex items-center"
                >
                  Manage Menu
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-4">
                <Button asChild className="w-full">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
