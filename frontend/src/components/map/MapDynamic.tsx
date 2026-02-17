"use client";

import dynamic from "next/dynamic";
import MapSkeleton from "@/components/skeletons/MapSkeleton";

const MapPageInner = dynamic(() => import("@/components/map/MapPageInner"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default MapPageInner;
