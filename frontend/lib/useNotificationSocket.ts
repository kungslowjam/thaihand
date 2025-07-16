"use client"
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNotificationStore } from '../store/notificationStore';

export function useNotificationSocket() {
  useEffect(() => {
    const socket = io('http://localhost:3001'); // เปลี่ยน URL เป็น backend จริง
    socket.on('notification', (data) => {
      useNotificationStore.getState().add({
        id: data.id,
        message: data.message,
        read: false,
        createdAt: data.createdAt,
      });
    });
    return () => { socket.disconnect(); };
  }, []);
} 