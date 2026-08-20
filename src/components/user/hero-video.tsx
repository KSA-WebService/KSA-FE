"use client";

import { useEffect, useRef } from "react";
import { HERO_SECTION_ID } from "@/components/user/site-header";

const HERO_VIDEO_SRC = "/user/hkust-campus.mp4";

// Home Hero (docs/user/product.md "Video Hero"): autoplay, muted, plays
// once, and stays on its final frame -- all native <video> behavior once
// `loop` is omitted, so no extra JS is needed for the end-state.
//
// The source video has encoded black letterbox bars baked into its frame.
// A plain `object-cover` only crops when the container's aspect ratio is
// taller than the video's -- on typical desktop viewports (similar or wider
// aspect than the source), it doesn't crop enough to remove the bars. The
// `scale-125` zoom on top of `object-cover`, clipped by the container's
// `overflow-hidden`, pushes the encoded bars out of the visible frame while
// preserving the video's aspect ratio (no stretching) and staying centered
// (`transform-origin` defaults to center). 1.25x is an estimate for this
// source and may need visual QA tuning against the real footage.
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Reasonable non-autoplay fallback without a new media asset: jump
      // straight to (near) the final frame and stay paused there, the same
      // end-state normal playback would have reached.
      const showFinalFrame = () => {
        video.pause();
        video.currentTime = Math.max(video.duration - 0.1, 0);
      };
      if (video.readyState >= 1) {
        showFinalFrame();
      } else {
        video.addEventListener("loadedmetadata", showFinalFrame, { once: true });
      }
      return;
    }

    video.play().catch(() => {
      // Autoplay can still be blocked by the browser; the video simply
      // stays on its first frame in that case.
    });
  }, []);

  return (
    <section
      id={HERO_SECTION_ID}
      className="relative h-[100svh] w-full overflow-hidden bg-text-primary"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-125 object-cover"
        src={HERO_VIDEO_SRC}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
    </section>
  );
}
