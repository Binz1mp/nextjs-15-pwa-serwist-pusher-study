'use client'

import { useState, useEffect } from 'react'
import pusherClient from './lib/pusher'

export default function Home() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    // Request notification permission on component mount if it hasn't been granted.
    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    // Subscribe to the "chat-channel".
    const channel = pusherClient.subscribe('chat-channel')

    channel.bind('new-message', (data: { message: string;}) => {
      // Always update the UI with the new message.
      setMessages((prev) => [...prev, data.message])

      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: data.message,
        })
      }
    })

    return () => {
      pusherClient.unsubscribe('chat-channel')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newMessage.trim() === '') return

    // Grab the socket id from pusherClient.
    const socketId = pusherClient.connection?.socket_id

    // Send the message along with the socket id.
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage, socketId }),
    })

    setNewMessage('')
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">Real-Time Message Board</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Type a message"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Send
        </button>
      </form>
      <ul>
        {messages.map((message, index) => (
          <li key={index} className="mb-2">
            {message}
          </li>
        ))}
      </ul>
    </main>
  )
}
