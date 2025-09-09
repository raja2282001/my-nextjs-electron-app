"use client"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [products] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      description:
        "High-quality wireless headphones with noise cancellation and premium sound quality for an immersive audio experience.",
      image: "/premium-wireless-headphones.png",
      originalPrice: 399.99,
      category: "Electronics",
      featured: true,
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      description:
        "Advanced fitness tracking watch with heart rate monitoring, GPS, and smart notifications to keep you connected.",
      image: "/smart-fitness-watch.png",
      category: "Wearables",
      featured: true,
    },
    {
      id: 3,
      name: "Organic Cotton T-Shirt",
      price: 29.99,
      description:
        "Comfortable and sustainable organic cotton t-shirt made from eco-friendly materials with a perfect fit.",
      image: "/organic-cotton-t-shirt.png",
      category: "Clothing",
      featured: false,
    },
    {
      id: 4,
      name: "Minimalist Desk Lamp",
      price: 89.99,
      description:
        "Sleek and modern desk lamp with adjustable brightness and USB charging port for your workspace needs.",
      image: "/minimalist-desk-lamp.png",
      category: "Home & Office",
      featured: false,
    },
    {
      id: 5,
      name: "Artisan Coffee Beans",
      price: 24.99,
      description:
        "Premium single-origin coffee beans roasted to perfection for a rich and aromatic coffee experience.",
      image: "/artisan-coffee-beans.png",
      category: "Food & Beverage",
      featured: false,
    },
    {
      id: 6,
      name: "Sustainable Water Bottle",
      price: 34.99,
      description:
        "Eco-friendly stainless steel water bottle that keeps drinks cold for 24 hours and hot for 12 hours.",
      image: "/sustainable-water-bottle.png",
      category: "Lifestyle",
      featured: false,
    },
  ])

  const featuredProducts = products.filter((product) => product.featured)
  const regularProducts = products.filter((product) => !product.featured)

  const [apiproduct, setapiproduct] = useState([])
  const [addingId, setAddingId] = useState<string | null>(null)
  const [cartQty, setCartQty] = useState<Record<string, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  // const [token, setToken] = useState<string | null>(null)
// const [user, setUser] = useState<any>(null)

// useEffect(() => {
//   setToken(localStorage.getItem("ecommerce_token"))
//   const stored = localStorage.getItem("ecommerce_user")
//   if (stored) setUser(JSON.parse(stored))
// }, [])
const token =
  typeof window !== "undefined"
    ? localStorage.getItem("ecommerce_token")
    : null

// ✅ Safe way to read user
const user =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
    : null

  const productlist = () => {
    if (!token) return
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/product/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setapiproduct(res.data.data)
      })
      .catch((error) => {
        console.error("Error fetching API products:", error)
      })
  }

  const fetchCart = async () => {
      // if (typeof window === "undefined") return
    try {
      // const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
      // const token = localStorage.getItem("ecommerce_token")
      // const userId = user?._id
      if (!user?._id  || !token) {
        setCartQty({})
        return
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart/list`, {
        params: { user_id: user._id  },
        headers: { Authorization: `Bearer ${token}` },
      })

      const items: Array<{ productId: string; quantity: number }> = res?.data?.data?.items || []
      const map: Record<string, number> = {}
      for (const it of items) {
        if (it?.productId) map[it.productId] = it.quantity || 0
      }
      setCartQty(map)
    } catch (err) {
      setCartQty({})
    }
  }

  useEffect(() => {
    productlist()
    fetchCart()
  }, [])

  const addwishlist = (product: any) => {
      // if (typeof window === "undefined") return
    // const user = JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
     if (!user?._id || !product?._id || !token) return
    console.log(product?.id, user?.id)
    const userid = user?._id
    const productid = product?._id

    if (!userid || !productid) {
      alert("User ID or Product ID is missing.")
      return
    }

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/add`,
        {
          userid: userid,
          productid: productid,
        },
        {
          headers: { Authorization: `Bearer ${token}` } 
        },
      )
      .then((res) => {
        productlist()
      })
      .catch((error) => {
        console.error("Failed to add product to wishlist:", error)
      })
  }

  const removewishlist = (product: any) => {
      if (typeof window === "undefined") return

    // const user = JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
    const userid = user?._id
    const productid = product?._id

    if (!userid || !productid) {
      alert("User ID or Product ID is missing.")
      return
    }

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/remove`,
        {
          userid: userid,
          productid: productid,
        },
        {
          headers: { Authorization: `Bearer ${token}` } 
        },
      )
      .then((res) => {
        productlist()
      })
      .catch((error) => {
        console.error("Failed to remove product from wishlist:", error)
      })
  }

  const updateCart = async (productId: string, quantity: number) => {
      if (typeof window === "undefined") return

    // const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
    // const token = localStorage.getItem("ecommerce_token")
    const userId = user?._id
    if (!userId || !productId) {
      alert("User ID or Product ID is missing.")
      return
    }

    const nextQty = quantity

    try {
      setUpdatingId(productId)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
        { userId, productId, quantity: nextQty },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await fetchCart()
    } catch (err) {
      console.error("Update cart failed:", err)
      alert("Failed to update cart. Please try again.")
    } finally {
      setUpdatingId(null)
    }
  }

  const increment = async (product: any) => {
    const pid = product?._id
    const current = cartQty[pid] || 0
    await updateCart(pid, current + 1)
  }

  const decrement = async (product: any) => {
    const pid = product?._id
    const current = cartQty[pid] || 1
    if (current <= 0) return
    await updateCart(pid, current - 1)
  }

  const addToCart = async (product: any, quantity = 1) => {
      if (typeof window === "undefined") return

    try {
      // const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
      // const token = localStorage.getItem("ecommerce_token")
      const userId = user?._id
      const productId = product?._id

      if (!userId) {
        alert("Please log in to add items to your cart.")
        return
      }
      if (!productId) {
        alert("Product ID is missing.")
        return
      }

      setAddingId(productId)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
        { userId, productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      await fetchCart()
    } catch (err) {
      console.error("Add to cart failed:", err)
      alert("Failed to add to cart. Please try again.")
    } finally {
      setAddingId(null)
    }
  }


  const handleclick = (id: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("ecommerce_product_id", JSON.stringify(id))
    router.push("/product")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">ModernStore</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
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
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Discover Amazing Products
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Curated collection of premium products designed to enhance your lifestyle
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {apiproduct?.map((product: any) => {
              const qty = cartQty[product?._id] || 0
              return (
                <div
                  key={product?._id}
                  onClick={() => handleclick(product?._id)}
                  className="group bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product?.img || "/placeholder.svg"}
                      alt={product?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product?.wishlist == false ? (
                      <button
                        className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          addwishlist(product)
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          removewishlist(product)
                        }}
                      >
                        <svg className="w-5 h-5 text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{product?.category}</div>
                    <h4 className="text-xl font-semibold text-card-foreground mb-3">{product?.name}</h4>
                    <p className="text-muted-foreground mb-4 text-pretty">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-foreground">${product?.price}</span>
                        {product?.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">${product?.originalPrice}</span>
                        )}
                      </div>
                      {qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-60"
                            onClick={(e) => {
                              e.stopPropagation()
                              decrement(product)
                            }}
                            disabled={updatingId === product?._id}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center font-medium">{qty}</span>
                          <button
                            className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                            onClick={(e) => {
                              e.stopPropagation()
                              increment(product)
                            }}
                            disabled={updatingId === product?._id}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="bg-accent text-accent-foreground px-6 py-2 rounded-md font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(product, 1)
                          }}
                          disabled={addingId === product?._id}
                        >
                          {addingId === product?._id ? "Adding..." : "Add to Cart"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-8 text-center">All Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apiproduct.map((product : any) => {
              const qty = cartQty[product?._id] || 0
              return (
                <div
                  key={product?._id}
                  className="group bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product?.img || "/placeholder.svg"}
                      alt={product?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-2 text-balance">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 text-pretty line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-foreground">${product.price}</span>
                      {qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-60 text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              decrement(product)
                            }}
                            disabled={updatingId === product._id}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center font-medium">{qty}</span>
                          <button
                            className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              increment(product)
                            }}
                            disabled={updatingId === product._id}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(product, 1)
                          }}
                          disabled={addingId === product._id}
                        >
                          {addingId === product._id ? "Adding..." : "Add to Cart"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold text-foreground mb-4">ModernStore</h5>
              <p className="text-muted-foreground text-sm">
                Your destination for premium products and exceptional quality.
              </p>
            </div>
            <div>
              <h6 className="font-medium text-foreground mb-3">Shop</h6>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Electronics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Clothing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Home & Office
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium text-foreground mb-3">Support</h6>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-medium text-foreground mb-3">Connect</h6>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Social Media
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ModernStore. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  )
}
