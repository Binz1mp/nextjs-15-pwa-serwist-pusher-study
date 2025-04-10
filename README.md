# nextjs-15-pwa-serwist-pusher-study
study

## Hosting
[vercel](https://nextjs-15-pwa.vercel.app/)

## Issue
1. [Currently the push notification not working on mobile platform.](https://github.com/web-push-libs/web-push/issues/929)
2. Pusher notification is sending push notification on message sender, too.

## env
```shell
# pwa service worker
WEB_PUSH_EMAIL=user@example.com
WEB_PUSH_PRIVATE_KEY=
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=

# pusher
PUSHER_APP_ID=
PUSHER_APP_SECRET=
NEXT_PUBLIC_PUSHER_APP_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

## Source
[How to use Pusher in Next.js (App Router)](https://selcuk00.medium.com/how-to-use-pusher-in-next-js-app-router-1132b8ddf3b5)  
[serwist/examples/next-web-push](https://github.com/serwist/serwist/tree/main/examples/next-web-push)