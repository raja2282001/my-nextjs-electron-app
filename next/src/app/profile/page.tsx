"use client"

import axios from "axios"
import { useRouter } from "next/navigation"
import type React from "react"

import { useEffect, useState } from "react"
import { gql, useQuery, useMutation } from "@apollo/client";


interface FormData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface User {
  name: string
  customerId: number
  email: string
  _id?: string
  wishlist: Array<{
    _id: string
    name: string
    description: string
    price: number
    img?: string
  }>  
}


const USER_ID =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("ecommerce_user") || "{}")?._id
    : null;

const GET_USER = gql`
   query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      wishlist {
        id
        name
        price
      }
    }
  }
`;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const router=useRouter()

  // Mock user data based on the schema
  const [user, setUser] = useState<User | null>(null)
  const [userlist,setuserlist]=useState<User | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!user) return

  // Update local state
  setUser({
    ...user,
    name: formData.name,
    email: formData.email,
  })

  console.log("Profile updated locally:", formData)

  const payload = {
    name: formData.name,
    email: formData.email,
    password: formData.newPassword || undefined, // send password only if entered
  }

  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${user.customerId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ecommerce_token")}`,
        },
      }
    )
    console.log("Profile updated successfully:", res.data)
  } catch (error) {
    console.error("Failed to update profile:", error)
  }
}


  const handleRemoveFromWishlist = (productId: string) => {
  if (!user?.wishlist) return

  setUser({
    ...user,
    wishlist: user.wishlist.filter((item) => item._id !== productId),
  })
}


 const handlelogout=()=>{
    localStorage.removeItem("ecommerce_token")
    localStorage.removeItem("ecommerce_user")
    router.push("/login")
  }

  const sidebarItems = [
    {
      id: "profile",
      name: "Update Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "wishlist",
      name: "Wishlist",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "logout",
      name: "Logout",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ]

  const listuserdetail=()=>{
    const user=JSON.parse(localStorage.getItem("ecommerce_user")||"")

    const userId=user?._id

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,{
      headers:{
        Authorization:`Bearer ${localStorage.getItem("ecommerce_token")}`
      }
    }).then((res)=>{
      setUser(res.data.data)
      setFormData((pre)=>({
        ...pre,
        name:res.data.data.name,
        email:res.data.data.email,
      }))
    }).catch((error)=>{
      console.log(error)
    })
  }

  useEffect(()=>{
    listuserdetail()
  },[])

  const removewishlist=(product:any)=>{
     const user = JSON.parse(localStorage.getItem("ecommerce_user") || "null")
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
    //   productdetail(product?._id)
    listuserdetail()
    }).catch((error)=>{
      // alert("Failed to remove product from wishlist.")
    })
  }


  const { data, loading, error, refetch } = useQuery(GET_USER, {
      variables: { id: USER_ID},
    });

    console.log("User data from Apollo:", data);

    useEffect(()=>{
      const userdetail= user ? user : data?.user

      if(userdetail){
        setuserlist(userdetail)
        setFormData((pre)=>({
          ...formData,
          name:userdetail?.name,
          email:userdetail?.email
        }))
      }
    },[data,user])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userlist?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{userlist?.name}</h2>
                <p className="text-sm text-gray-600">{userlist?.email}</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => (item.id === "logout" ? handlelogout() : setActiveTab(item.id))}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Update Profile</h1>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                     onClick={(e) => handleUpdateProfile(e)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Profile
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

              {(userlist?.wishlist || []).length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600">Start adding products you love to your wishlist!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userlist?.wishlist.map((product : any) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={product.img || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-green-600 font-bold text-lg mb-2">₹{product.price.toLocaleString()}</p>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removewishlist(product)}
                            className="bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
