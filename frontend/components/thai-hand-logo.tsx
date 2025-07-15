import React from "react"

interface ThaiHandLogoProps {
  className?: string
  style?: React.CSSProperties
}

export function ThaiHandLogo({ className, style }: ThaiHandLogoProps) {
  return (
    <img
      src="/thaihand-logo.png"
      alt="ThaiHand Logo"
      className={className}
      style={style}
    />
  )
}
