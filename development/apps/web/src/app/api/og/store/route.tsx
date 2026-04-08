import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("name") || "U-Shop Store";
    const handle = searchParams.get("handle") || "";
    
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "linear-gradient(to bottom right, #520f85, #d41295)",
            color: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "60px",
              backgroundColor: "white",
              color: "#520f85",
              fontSize: "60px",
              fontWeight: "bold",
              marginBottom: "30px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            {storeName.charAt(0).toUpperCase()}
          </div>
          
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 800,
              margin: 0,
              padding: 0,
              lineHeight: 1.2,
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {storeName}
          </h1>
          
          {handle && (
            <p
              style={{
                fontSize: "36px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.8)",
                marginTop: "16px",
              }}
            >
              U-Shop | @{handle}
            </p>
          )}

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", fontSize: "24px", fontWeight: "bold" }}>
              Only on Campus. Only on U-Shop.
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response(`Failed to generate OS image`, {
      status: 500,
    });
  }
}
