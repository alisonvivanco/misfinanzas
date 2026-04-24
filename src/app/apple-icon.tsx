import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(45deg, #2563eb 0%, #7c3aed 55%, #d946ef 100%)",
          color: "white",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -6,
        }}
      >
        AV
      </div>
    ),
    size,
  );
}
