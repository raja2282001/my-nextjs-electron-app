"use client"

import axios from "axios"
import React, { useEffect } from "react"
import { json } from "stream/consumers"

type OrderItem = {
  productId: string
  quantity: number
  price: number
}

type ShippingAddress = {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}

type OrderPayload = {
  customerId: string
  items: OrderItem[]
  totalAmount: number
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled"
  shippingAddress: ShippingAddress
}

export default function NewOrderPage() {
  const token =
  typeof window !== "undefined"
    ? localStorage.getItem("ecommerce_token")
    : null

// ✅ Safe way to read user
const user =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
    : null

  const cartQty=typeof window !== "undefined"
  ? JSON.parse(localStorage.getItem("cartQty")||"[]")
  : []

  // React states for form fields
  const [customerId, setCustomerId] = React.useState(user?._id)
  const [status, setStatus] = React.useState<OrderPayload["status"]>("Pending")
  const [items, setItems] = React.useState<OrderItem[]>(cartQty)
  const [shipping, setShipping] = React.useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })
  const [submitting, setSubmitting] = React.useState(false)

  const totalAmount = React.useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0),
    [items],
  )

  useEffect(()=>{
    const cartQty=typeof window !== "undefined"
  ? JSON.parse(localStorage.getItem("cartQty")||"[]")
  : []

    const customer= typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
    : null
    setItems(cartQty)
    setCustomerId(customer._id)
  },[])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    // Basic validation for required fields
    if (!customerId) {
      alert("Customer ID is required.")
      setSubmitting(false)
      return
    }
    if (items.length === 0) {
      alert("At least one item is required.")
      setSubmitting(false)
      return
    }
    // for (const [i, it] of items.entries()) {
    //   if (!it.productId.trim()) {
    //     alert(`Item #${i + 1}: productId is required.`)
    //     setSubmitting(false)
    //     return
    //   }
    //   if ((Number(it.quantity) || 0) < 1) {
    //     alert(`Item #${i + 1}: quantity must be at least 1.`)
    //     setSubmitting(false)
    //     return
    //   }
    //   if (Number.isNaN(Number(it.price))) {
    //     alert(`Item #${i + 1}: price must be a number.`)
    //     setSubmitting(false)
    //     return
    //   }
    // }
    const must: (keyof ShippingAddress)[] = ["fullName", "address", "city", "postalCode", "country"]
    for (const key of must) {
      if (!shipping[key].trim()) {
        alert(`Shipping ${key} is required.`)
        setSubmitting(false)
        return
      }
    }

    const payload: OrderPayload = {
      customerId: customerId,
      items: items.filter((list)=>list.productId && list.quantity > 0 && list.price > 0),
      totalAmount: Number(totalAmount.toFixed(2)),
      status,
      shippingAddress: {
        fullName: shipping.fullName.trim(),
        address: shipping.address.trim(),
        city: shipping.city.trim(),
        postalCode: shipping.postalCode.trim(),
        country: shipping.country.trim(),
      },
    }

    // Replace with a real API call if needed
    console.log("[Order Form] Submitted payload:", payload)
    alert("Order payload (see console):\n\n" + JSON.stringify(payload, null, 2))
    setSubmitting(false)

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/order/place`,payload,{
      // headers:{
      //   Authorization : "Bearer " + localStorage.getItem("ecommerce_token")
      // }
      headers:{ Authorization : `Bearer ${token}` }
    }).then((response) => {
      console.log("[Order Form] API response:", response.data)
      alert("Order placed successfully!")
    }).catch((error) => {
      console.error("[Order Form] API error:", error)
      alert("Failed to place order.")
    }).finally(() => {
      setSubmitting(false)
    })
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl p-6">
        <header className="mb-6">
          <h1 className="text-pretty text-2xl font-semibold">Create Order</h1>
          <p className="text-sm text-muted-foreground">Minimal Tailwind form mapped to your Order schema.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Order details */}
          {/* <section className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-medium">Order Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="customerId" className="text-sm font-medium">
                  Customer ID
                </label>
                <input
                  id="customerId"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="ObjectId of User"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderPayload["status"])}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
          </section> */}

          {/* Items */}
          {/* <section className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="md:col-span-6 flex flex-col gap-2">
                      <label className="text-sm font-medium" htmlFor={`productId-${idx}`}>
                        Product ID
                      </label>
                      <input
                        id={`productId-${idx}`}
                        required
                        value={it.productId}
                        onChange={(e) => updateItem(idx, { productId: e.target.value })}
                        placeholder="ObjectId of Product"
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-2">
                      <label className="text-sm font-medium" htmlFor={`quantity-${idx}`}>
                        Quantity
                      </label>
                      <input
                        id={`quantity-${idx}`}
                        type="number"
                        min={1}
                        required
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="md:col-span-3 flex flex-col gap-2">
                      <label className="text-sm font-medium" htmlFor={`price-${idx}`}>
                        Price
                      </label>
                      <input
                        id={`price-${idx}`}
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={it.price}
                        onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Line total: {(Number(it.quantity) * Number(it.price) || 0).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      aria-label={`Remove item ${idx + 1}`}
                      className="rounded-md border px-3 py-2 text-sm text-destructive border-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-medium">Total Amount</span>
                <input
                  readOnly
                  value={totalAmount.toFixed(2)}
                  className="w-32 rounded-md border bg-muted px-3 py-2 text-right text-sm"
                  aria-label="Total amount"
                />
              </div>
            </div>
          </section> */}

          {/* Shipping */}
          <section className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-medium">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="fullName"
                  required
                  value={shipping.fullName}
                  onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <input
                  id="address"
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="city" className="text-sm font-medium">
                  City
                </label>
                <input
                  id="city"
                  required
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="postalCode" className="text-sm font-medium">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  required
                  value={shipping.postalCode}
                  onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country
                </label>
                <input
                  id="country"
                  required
                  value={shipping.country}
                  onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                  className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="reset"
              onClick={() => {
                setCustomerId("")
                setStatus("Pending")
                setItems([{ productId: "", quantity: 1, price: 0 }])
                setShipping({ fullName: "", address: "", city: "", postalCode: "", country: "" })
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
