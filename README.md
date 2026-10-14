<div align="center">
  <h1>🧭 Dira</h1>
  <p><b>The edge-native link management & real-time telemetry engine.</b></p>
  <p><i>Sub-10ms global redirects • Off-thread virtualized analytics • 60FPS 3D WebGL traffic visualization.</i></p>

  [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Edge Ready](https://img.shields.io/badge/Deployment-Vercel%20Edge-black)](https://vercel.com)
</div>

---

## 🌟 Overview

**Dira** (*Swahili for "Compass" or "Guidance Star"*) is an open-source, high-throughput link management and real-time attribution platform engineered for extreme performance.

Traditional link management systems suffer from three critical bottlenecks: latency-heavy database lookups on redirects, UI thread freezing when rendering massive click event logs, and flat, static reporting dashboards. Dira eliminates these bottlenecks with an edge-native architecture that routes traffic in **under 10ms**, offloads heavy data filtering to **Web Workers**, and streams real-time global clicks onto a **60FPS 3D WebGL Globe**.

---

## ✨ Core Architecture & Key Features

### ⚡ 1. Sub-10ms Edge Routing Engine
* **Non-Blocking Telemetry:** Redirects are evaluated directly in Edge Middleware via edge-native KV storage (Upstash Redis).
* **Asynchronous Event Streaming:** Click metadata (geo-location, user-agent, referral headers) is dispatched asynchronously to a background queue without holding up the HTTP response.

### 📊 2. Off-Thread Virtualized Data Grid (100k+ Rows)
* **Zero UI Jank:** Performs heavy filtering, searching, and sorting of 100,000+ historical click records inside a background **Web Worker**.
* **Instant Local Caching:** Utilizes **IndexedDB** and **TanStack Virtual** to maintain a buttery-smooth 60FPS scrolling experience with 0ms API fetch latency on active searches.

### 🌍 3. Interactive 3D WebGL Traffic Globe
* **Spatial Visualization:** Built with **Three.js** and **React Three Fiber**.
* **Live WebSocket Streaming:** Ingests incoming global click events in real time, rendering glowing telemetry arcs across country coordinates at a locked 60FPS.

---

## 📐 System Architecture

```text
[Incoming Request] ──► [Vercel Edge Middleware] ──► Sub-10ms Redirect (307)
                             │ (Async Non-Blocking)
                             ▼
                 [Upstash Redis / Queue]
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
   [Web Worker Engine]              [WebSocket Server]
(Client Sorting & Filtering)    (Live Telemetry Streamer)
             │                               │
             ▼                               ▼
 [Virtualized Data Grid]         [3D WebGL Globe (R3F)]