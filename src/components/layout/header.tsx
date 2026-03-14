"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCartStore } from "@/lib/store/cart-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, ShoppingCart, LogIn, UserPlus } from "lucide-react"

export function Header() {
  const { isAuthenticated, user } = useAuthStore()
  const items = useCartStore((state) => state.items)
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">

        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            🍔 GeoZakaz
          </span>
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/menu" className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
            Меню
          </Link>
          {isAuthenticated && user?.role === "admin" && (
            <Link href="/dashboard" className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors">
              Панель админа
            </Link>
          )}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user?.role === "customer" && (
            <>
              {/* Корзина */}
              <Link href="/cart">
                <Button variant="outline" size="icon" className="relative border-orange-300 hover:bg-orange-50 min-h-[44px] min-w-[44px]" aria-label="Корзина">
                  <ShoppingCart className="h-5 w-5 text-orange-500" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Личный кабинет */}
              <Link href="/profile">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white min-h-[44px] gap-2 shadow-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name || "Кабинет"}</span>
                </Button>
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 min-h-[44px] gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Войти</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white min-h-[44px] gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Регистрация</span>
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
