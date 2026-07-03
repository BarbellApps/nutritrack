import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#0b6e2c",
          borderRadius: 7,
          color: "#f4fcee",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}
