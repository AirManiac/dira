import type { Metadata } from "next";

import { ObservatoryWorkspace } from "@/components/analytics/observatory-workspace";

export const metadata: Metadata = {
  title: "Link Observatory | Link Performance Lab",
  description:
    "Explore redirect performance, click traffic patterns, and individual request events in Link Performance Lab.",
};

export default function DayThreePage() {
  return <ObservatoryWorkspace />;
}
