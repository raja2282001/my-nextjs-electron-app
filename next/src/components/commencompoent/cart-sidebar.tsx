"use client"

import axios from "axios"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type CartSliderProps = {
  open: boolean
  onClose: () => void
   setIsCartOpen: (open: boolean) => void
}

type CartItem = {
  _id: string
  productId: string
  name: string
  price: number
  quantity: number
}


export function CartSlider({ open,setIsCartOpen,onClose }: CartSliderProps) {
  const [allcart, setAllCart] = useState<CartItem[]>([])
  const pathname = usePathname()
    const router = useRouter() 

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const fetchCart = async () => {
    if(!window.navigator.onLine) return
    try {
      const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
      const token = localStorage.getItem("ecommerce_token")
      const userId = user?._id
      if (!userId || !token) {
        setAllCart([])
        return
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart/list`, {
        params: { user_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      })

      const items: CartItem[] = res?.data?.data?.items || []
      setAllCart(items)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [open])

   const orderButton = () => {
    router.push("/order/form")
    setIsCartOpen(false)
    localStorage.setItem("cartQty", JSON.stringify(allcart))
  }

  const subtotal = allcart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="flex h-[calc(100%-4rem)] flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {allcart.length === 0 ? (
              // Empty state
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <svg
                  className="h-10 w-10 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H19m-12 0a1 1 0 11-2 0 
                    1 1 0 012 0zm12 0a1 1 0 11-2 0 
                    1 1 0 012 0z"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {allcart.map((item) => ( 
                    item.quantity > 0 &&
                  <li
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-base font-medium text-foreground">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                // href="/cart"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Go to Cart
              </a>
              <button
                onClick={orderButton}
                className="flex-1 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </footer>
        </div>
      </aside>
    </>
  )
}
