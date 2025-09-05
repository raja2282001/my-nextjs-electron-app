"use client"

import axios from "axios"
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  img: string;
  description: string;
  averageRating: number;
  ratings: Array<{ userId: string; rating: number; comment: string }>;
  wishlist?: boolean;
};
// This would be your dynamic route page
export default function ProductDetailPage() {
  // In a real app, you'd fetch this data based on the ID from params
  const [products, setProducs] =  useState<Product | null>(null);
    const [dates, setDates] = useState({ added: "", updated: "" });
   const { id } = useParams<{ id: string }>();
  const router = useRouter();
    const [cartQty, setCartQty] = useState<Record<string, number>>({})
    const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)


  const productdetail=(id:string | number)=>{
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/product/detail/${id}`,
        {
            headers:{
                Authorization:`Bearer ${localStorage.getItem("ecommerce_token")}`
            }
        }
    ).then((res)=>{
        setProducs(res.data.data)
    }).catch((error)=>{
        console.log(error)
    })
  }

  useEffect(()=>{
    // if(id){
        productdetail(id)
    // }
  },[])


  useEffect(() => {
  setDates({
    added: products?.createdAt ? new Date(products.createdAt).toLocaleDateString() : "",
    updated: products?.updatedAt ? new Date(products.updatedAt).toLocaleDateString() : "",
  });
}, [products]);

  const addtowishlist=(product:any)=>{


      const user = JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
      console.log(product?.id,user?.id)
    const userid=user?._id;
    const productid=product?._id

    if(!userid || !productid){
        alert("User ID or Product ID is missing.")
        return;
    }

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/add`,{
      userid: userid,
      productid: productid
    },{
        headers:{
            Authorization: `Bearer ${localStorage.getItem("ecommerce_token")}`
        }
    }).then((res)=>{
      // alert("Product added to wishlist!")
      productdetail(product?._id)
        setProducs((prev) => (prev ? { ...prev, wishlist: true } : prev))
    }).catch((error)=>{
      // alert("Failed to add product to wishlist.")
    })
  }

  const removewishlist=(product:any)=>{
    const user = JSON.parse(localStorage.getItem("ecommerce_user") || "{}")
    const userid=user?._id;
    const productid=product?._id

    if(!userid || !productid){
        alert("User ID or Product ID is missing.")
        return;
    }

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/remove`,{
      userid: userid,
      productid: productid
    },{
        headers:{
            Authorization: `Bearer ${localStorage.getItem("ecommerce_token")}`
        }
    }).then((res)=>{
      // alert("Product removed from wishlist!")
      productdetail(product?._id)
    }).catch((error)=>{
      // alert("Failed to remove product from wishlist.")
    })
  }

  const wishlistHandler=(product : any)=>{
     console.log("product",product)

     if(product.wishlist){
        removewishlist(product)
     }else{
        addtowishlist(product)
     }
  }


  const fetchCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
      const token = localStorage.getItem("ecommerce_token")
      const userId = user?._id
      if (!userId || !token) {
        setCartQty({})
        return
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart/list`, {
        params: { user_id: userId },
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


  useEffect(()=>{
    fetchCart()
  },[])

  const qty = products?._id ? cartQty[products._id] || 0 : 0


   const updateCart = async (productId: string, quantity: number) => {
    const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
    const token = localStorage.getItem("ecommerce_token")
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
    try {
      const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
      const token = localStorage.getItem("ecommerce_token")
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumb */}
      {/* <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm">
    fetchCart()
  })


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumb */}
      {/* <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm">
            <a href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </a>
            <span className="mx-2 text-gray-400">/</span>
            <a href="/products" className="text-gray-500 hover:text-gray-700">
              Products
            </a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {
          products &&
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
                <img src={products.img} alt={products.name} className="w-full h-full object-cover" />
              </div>

              {/* Thumbnail Images */}
              {/* <div className="flex space-x-2">
                <div className="w-20 h-20 bg-white rounded-lg shadow-sm overflow-hidden border-2 border-blue-500">
                  <img src="/modern-smartphone.png" alt="Thumbnail 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-20 bg-white rounded-lg shadow-sm overflow-hidden">
                  <img src="/smartphone-back.png" alt="Thumbnail 2" className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-20 bg-white rounded-lg shadow-sm overflow-hidden">
                  <img src="/smartphone-side.png" alt="Thumbnail 3" className="w-full h-full object-cover" />
                </div>
              </div> */}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{products.name}</h1>
              <div className="flex items-center space-x-2">
        {/* ⭐ Dynamic Stars */}
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>
                      {i < Math.round(products?.averageRating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>

                {/* Rating Number & Review Count */}
                <span className="text-sm text-gray-600">
                  ({products?.averageRating?.toFixed(1)}){" "}
                  {products?.ratings?.length || 0} reviews
                </span>
              </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-green-600">₹{products?.price?.toLocaleString()}</span>
                  <span className="text-lg text-gray-500 line-through">₹29,999</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">16% OFF</span>
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                <div className="space-y-2">
                  {products?.description?.split("\n")?.map((line, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Options */}
              {/* <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex space-x-3">
                  <button className="w-10 h-10 bg-black rounded-full border-2 border-gray-300 focus:border-blue-500"></button>
                  <button className="w-10 h-10 bg-blue-600 rounded-full border-2 border-gray-300 focus:border-blue-500"></button>
                  <button className="w-10 h-10 bg-purple-600 rounded-full border-2 border-blue-500"></button>
                </div>
              </div> */}

              {/* Storage Options */}
              {/* <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage</h3>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500">
                    128GB
                  </button>
                  <button className="px-4 py-2 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg">
                    256GB
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500">
                    512GB
                  </button>
                </div>
              </div> */}

              {/* Quantity */}
              {
                qty > 0 &&

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50" onClick={() => decrement(products)}>
                    <span className="text-xl" >-</span>
                  </button>
                  <span className="text-xl font-medium px-4">{qty}</span>
                  <button className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50" onClick={() => increment(products)}>
                    <span className="text-xl">+</span>
                  </button>
                </div>
              </div>
              }

              <div className="space-y-4">
                {
                  qty == 0 &&
                <div className="flex space-x-4">
                  <button className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  onClick={(e) => {
                              e.stopPropagation()
                              addToCart(products, 1)
                            }}
                  >
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  onClick={(e) => {
                              e.stopPropagation()
                              addToCart(products, 1)
                            }}
                  >
                    Buy Now
                  </button>
                </div>
                }
              {/* Action Buttons */}

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold border-2 transition-colors ${
                    products.wishlist
                      ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100"
                      : "border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500"
                  }`}
                  onClick={()=>wishlistHandler(products)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">{products.wishlist ? "❤️" : "🤍"}</span>
                    <span>{products.wishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
                  </div>
                </button>
              </div>

              {/* Additional Info */}
              {/* <div className="border-t pt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Free delivery on orders above ₹499</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">↺</span>
                  </div>
                  <span className="text-gray-700">7 days return policy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">⚡</span>
                  </div>
                  <span className="text-gray-700">1 year warranty</span>
                </div>
              </div> */}

              {/* Product Meta */}
              <div className="border-t pt-6 text-sm text-gray-500 space-y-1">
                <p>Product ID: {products._id}</p>
                <p>Added: {dates.added}</p>
                <p>Last Updated: {dates.updated}</p>
              </div>
            </div>
          </div>
        }

        {/* Related Products Section */}
        {/* <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={`/modern-smartphone.png?height=250&width=250&query=smartphone-${item}`}
                    alt={`Related Product ${item}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Redmi Note 13 Pro</h3>
                  <p className="text-green-600 font-bold">₹19,999</p>
                  <div className="flex text-yellow-400 text-sm mt-1">
                    {"★".repeat(4)}
                    {"☆"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
}
