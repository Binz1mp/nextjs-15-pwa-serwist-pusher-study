import { type NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

export const POST = async (req: NextRequest) => {
  // Ensure necessary environment variables are set
  if (
    !process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ||
    !process.env.WEB_PUSH_EMAIL ||
    !process.env.WEB_PUSH_PRIVATE_KEY
  ) {
    throw new Error("Environment variables supplied not sufficient.");
  }

  // Parse request payload, expecting both subscription and message
  const { subscription, message } = await req.json() as {
    subscription: webPush.PushSubscription;
    message: string;
  };

  try {
    webPush.setVapidDetails(
      `mailto:${process.env.WEB_PUSH_EMAIL}`,
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY,
    );

    // Use the dynamic message in the payload
    const response = await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Push Message",
        message: message, // dynamic text here
      })
    );

    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: response.headers,
    });
  } catch (err) {
    if (err instanceof webPush.WebPushError) {
      return new NextResponse(err.body, {
        status: err.statusCode,
        headers: err.headers,
      });
    }
    console.error(err);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
};
