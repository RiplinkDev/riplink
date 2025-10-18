import Image from "next/image"

export default function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/riplink-logo.png"
        alt="Riplink"
        width={withText ? size * 5 : size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  )
}
