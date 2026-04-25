"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCartStore } from "@/lib/store/cart-store"
import { useLogout } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, ShoppingCart, LogIn, UserPlus, Package, LogOut } from "lucide-react"
import { getImageUrl } from "@/lib/utils/image"

interface HeaderSellerInfo {
  shopName?: string
  shopDescription?: string
  shopLogo?: string
}

interface HeaderProps {
  sellerInfo?: HeaderSellerInfo
}

export function Header({ sellerInfo }: HeaderProps = {}) {
  const { isAuthenticated, user } = useAuthStore()
  const items = useCartStore((state) => state.items)
  const logoutMutation = useLogout()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const isCustomer = user?.role === "customer"
  const brandName = sellerInfo?.shopName || "LotFood"
  const brandLogo = sellerInfo?.shopLogo
  const brandDescription = sellerInfo?.shopDescription || ""
  const isSellerBranded = Boolean(sellerInfo)

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg">
      <div className="container flex min-h-[72px] items-center justify-between px-4 py-3 gap-3">

        <div className="flex items-center gap-3 min-w-0 shrink">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {brandLogo ? (
              <img
                src={getImageUrl(brandLogo)}
                alt={brandName}
                className="h-10 w-10 rounded-full object-cover border-2 border-white/70 shrink-0"
              />
            ) : (
              <span className="text-2xl" aria-hidden="true">🍔</span>
            )}
            <div className="min-w-0">
              <p className="font-bold text-xl text-white drop-shadow truncate max-w-[180px] sm:max-w-[220px] md:max-w-[260px]">
                {brandName}
              </p>
              {isSellerBranded ? (
                <p className="text-xs text-orange-50/95 truncate hidden sm:block max-w-[260px]">
                  {brandDescription}
                </p>
              ) : null}
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {!isSellerBranded && (
            <Link href="/menu">
              <Button variant="outline" className="bg-white hover:bg-yellow-50 border-2 border-white text-orange-600 min-h-[44px]">
                Menu
              </Button>
            </Link>
          )}
          {isCustomer && (
            <>
              <Link href="/orders">
                <Button variant="outline" className="bg-white hover:bg-yellow-50 border-2 border-white text-orange-600 min-h-[44px] gap-2">
                  <Package className="h-4 w-4" />
                  My Orders
                </Button>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {isAuthenticated && isCustomer && (
            <>
              <Link href="/cart">
                <Button variant="outline" size="icon" className="relative min-h-[44px] min-w-[44px] bg-white hover:bg-yellow-50 border-2 border-white" aria-label="Cart">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/profile">
                <Button variant="outline" className="bg-white hover:bg-yellow-50 border-2 border-white text-orange-600 min-h-[44px] gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name || "Profile"}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="bg-white hover:bg-yellow-50 border-2 border-white text-orange-600 min-h-[44px] gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/login">
                <Button variant="outline" className="bg-white hover:bg-yellow-50 border-2 border-white text-orange-600 min-h-[44px] gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white min-h-[44px] gap-2 border-2 border-orange-600">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign up</span>
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
