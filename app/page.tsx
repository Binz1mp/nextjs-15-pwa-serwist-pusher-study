import type { Metadata } from "next";

import SendNotification from "./SendNotification";
import PusherBoard from "./PusherBoard";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return (
    <>
      <h1>Next.js + Serwist + Pusher</h1>
      <SendNotification />
      <PusherBoard />
    </>
  );
}
