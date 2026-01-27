import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 32, height: 32 };

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 28,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fde6e6 0%, #e6f0ff 100%)",
          borderRadius: 6,
        }}
      >
        🦞
      </div>
    ),
    { ...size }
  );
}
