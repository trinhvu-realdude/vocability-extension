import { C } from "~src/utilities";

function Spinner({ size = 20, color = C.primary }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid rgba(0,0,0,0.05)`,
      borderTopColor: color,
      animation: "voc-spin 0.7s linear infinite",
      flexShrink: 0
    }} />
  )
}

export default Spinner