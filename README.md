# Kwan

A concept prototype of a subscription commuter bus for Accra, booked in the phone browser.
"Kwan" is Twi for road.

This is a personal design project. It is not a real service: the routes, times, prices and riders are made up,
there is no backend, and no money moves.

**Live prototype:** https://benje789amoah-arch.github.io/kwan/

## What it covers

- **Rider app:** sign in, find a route, pick stops and a plan, pay with mobile money, and board with a code that
  opens without data.
- **Changing a stop** without contacting support.
- **Missing a bus:** catch it at the next stop, or use a ride save.
- **Driver check-in:** a keypad and rider list for a basic phone held in one hand.

"Prototype controls" in the Account tab picks the moment to look at, since there is no live bus.

It follows the phone's light or dark setting. The boarding pass stays black on white in both so the QR code always scans.

## Run it

```bash
npm install
npm run dev
```

## Publish it

```bash
npm run deploy
```

Built with React, TypeScript, Vite and Tailwind CSS.
