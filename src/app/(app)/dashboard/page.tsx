"use client"

import MessageCard from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Message } from '@/models/user.model'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import React, { Key, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const page = () => {
  const {data: Session} = useSession()
  const user: User = Session?.user as User

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const {register, watch, setValue} = form

  const acceptMessages = watch("acceptMessages")

  const fetchAcceptMessages = useCallback( async () => {
    setIsSwitching(true)

    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages")
  
      if (response.data.success) {
        setValue("acceptMessages", response.data.isAcceptingMessages as boolean)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>

      toast.error(axiosError.response?.data.message || "Failed to fetch message settings")
    } finally {
      setIsSwitching(false)
    }

  }, [setValue])


  const fetchMessages = useCallback( async (refresh: boolean = false) => {
    setLoading(true)
    setIsSwitching(false) 

    try {
      const response = await axios.get<ApiResponse>("/api/get-messages")

      if (response.data.success) {
        setMessages(response.data.messages as Message[])
      } else {
        toast.error(response.data.message)
      }

      if (refresh){
        toast.info("Showing latest messages")
      }
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>

      toast.error(axiosError.response?.data.message || "Failed to fetch messages")
    } finally {
      setLoading(false)
      setIsSwitching(false)
    }
  }, [setLoading, setMessages])

  useEffect(() => {
    if (!Session || !user) return

    fetchMessages()
    fetchAcceptMessages()
  }, [Session, setValue, fetchAcceptMessages, fetchMessages])


  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages
      })

      if (response.data.success) {
        setValue("acceptMessages", !acceptMessages)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message)
    }
  }

  const {username} = user
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.info("Profile URL copied to clipboard")
  }

  if (!Session || !user) {
    return <div>Please login</div>
  }

  return (
    <div className='my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl'>
      <h1 className='text-4xl font-bold mb-4'>User Dashboard</h1>

      <div className='mb-4'>
        <h2 className='text-lg font-semibold mb-2'>Copy your unique link</h2>
        <div className='flex items-center'>
          <input 
          type="text"
          value={profileUrl}
          disabled
          className='input input-bordered w-full p-2 mr-2' />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className='mb-4'>
        <Switch
        {...register("acceptMessages")}
        checked={acceptMessages}
        onCheckedChange={handleSwitchChange}
        disabled={isSwitching} />
        <span className='ml-2'>
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
      className='mt-4'
      variant="outline"
      onClick={(e) => {
        e.preventDefault()
        fetchMessages(true)
      }} >
        {
          loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <RefreshCcw className='w-4 h-4' />
          )
        }
      </Button>

      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
            key={message._id as Key}
            message={message}
            onMessageDelete={handleDeleteMessage} />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default page
