"use client";
import type { MouseEventHandler } from "react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const base64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function SendNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      toast.info("Service worker is supported");
      navigator.serviceWorker.ready.then((reg) => {
        toast.info("Service worker is ready");
        reg.pushManager.getSubscription().then((sub) => {
          if (sub && (!sub.expirationTime || Date.now() < sub.expirationTime - 5 * 60 * 1000)) {
            toast.info("Already subscribed");
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  useEffect(() => { toast.info("Status of subscription: " + (subscription ? "Exists" : "None")); }, [subscription]);
  useEffect(() => { toast.info("Status of isSubscribed: " + isSubscribed); }, [isSubscribed]);
  useEffect(() => { toast.info("Status of registration: " + (registration ? "Ready" : "Not ready")); }, [registration]);

  const requestPermissionButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    try {
      const permissionResult = await Notification.requestPermission();
      toast.info("Notification permission: " + permissionResult);
    } catch (error) {
      toast.error("Error while requesting notification permission");
      console.error("Error while requesting notification permission:", error);
    }
  };

  const subscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    toast.info("Current Notification permission: " + Notification.permission);
    if (Notification.permission !== "granted") {
      try {
        const permissionResult = await Notification.requestPermission();
        toast.info("Permission result from request: " + permissionResult);
        if (permissionResult !== "granted") {
          toast.error("Notification permission not granted: " + permissionResult);
          return;
        }
      } catch (error) {
        toast.error("Error while requesting notification permission");
        console.error("Error while requesting notification permission:", error);
        return;
      }
    }
    toast.info("Notification permission after request: " + Notification.permission);

    if (!process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY) {
      throw new Error("Environment variables supplied not sufficient.");
    }
    if (!registration) {
      toast.error("No service worker registration available.");
      return;
    }

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY),
      });
      setSubscription(sub);
      setIsSubscribed(true);
      toast.success("Web push subscribed!");
      console.log("Web push subscribed!", sub);
    } catch (error) {
      toast.error("Failed to subscribe for push notifications. Check browser settings.");
      console.error("Push subscription error:", error);
    }
  };

  const unsubscribeButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    if (!subscription) {
      toast.error("Web push not subscribed");
      console.error("Web push not subscribed");
      return;
    }
    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      toast.success("Web push unsubscribed!");
      console.log("Web push unsubscribed!");
    } catch (err) {
      toast.error("Error during unsubscribe");
      console.error("Error during unsubscribe:", err);
    }
  };

  const sendNotificationButtonOnClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
  
    if (!subscription) {
      toast.error("Web push not subscribed");
      return;
    }
  
    // Assume you have a dynamic message – you might get this from state or an input field
    const dynamicMessage = "Your custom push message here!"; 
    try {
      await fetch("/notification", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ subscription, message: dynamicMessage }),
        signal: AbortSignal.timeout(10000),
      });
      toast.success("Notification sent!");
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "TimeoutError") {
          toast.error("Timeout: It took too long to get the result.");
        } else if (err.name === "AbortError") {
          toast.error("Fetch aborted.");
        } else if (err.name === "TypeError") {
          toast.error("AbortSignal.timeout() is not supported.");
        } else {
          toast.error(`Error: ${err.name}: ${err.message}`);
        }
      } else {
        toast.error("An unknown error occurred while sending notification.");
      }
      console.error("Error while sending notification:", err);
    }
  };
  

  return (
    <>
      <button type="button" onClick={requestPermissionButtonOnClick}>
        Request Notification Permission
      </button>
      <button type="button" onClick={subscribeButtonOnClick} disabled={isSubscribed}>
        Subscribe
      </button>
      <button type="button" onClick={unsubscribeButtonOnClick} disabled={!isSubscribed}>
        Unsubscribe
      </button>
      <button type="button" onClick={sendNotificationButtonOnClick} disabled={!isSubscribed}>
        Send Notification
      </button>
      <ToastContainer
        position="bottom-right"
        newestOnTop={false}
        pauseOnHover={false}
        closeOnClick={true}
        autoClose={2000}
      />
    </>
  );
}
