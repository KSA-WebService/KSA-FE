import Image from "next/image";

// Shared HKUST campus background for Login/Account Activation
// (docs/user/user-ui.md "Shared Auth Visual Direction"). CSS-only treatment
// -- the source asset itself is never edited.
//
// This replacement photo already has good natural color balance/saturation
// (unlike the earlier source, which needed heavier desaturation), so
// contrast/saturation are left close to their originals -- only brightness
// is reduced further, plus one flat 15% black wash (no gradient, no blur),
// to push the card's emphasis closer to the Admin login page's darker
// backdrop without literally copying Admin's heavy gradient treatment. The
// red sculpture and the natural blue/white/red palette stay recognizable;
// the photo still reads as a photograph, not a graded or greyed-out
// background.
export function AuthBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-page-bg">
      <Image
        src="/user/hkust-campus.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover brightness-[0.62] contrast-[0.96] saturate-[0.9]"
      />
      <div className="absolute inset-0 bg-black/15" />
    </div>
  );
}
