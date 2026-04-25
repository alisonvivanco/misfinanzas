import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 55%, #c026d3 100%)",
          color: "white",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: -2,
          borderRadius: 14,
        }}
      >
        AV
      </div>
    ),
    size,
  );
}
