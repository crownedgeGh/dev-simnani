// Shows any image (portrait, landscape, square) in full without cropping,
// by filling the frame with a blurred, zoomed copy behind the un-cropped image.
export default function BlurredImageFrame({ src, alt = "", className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-60"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="relative h-full w-full object-contain" />
    </div>
  );
}
