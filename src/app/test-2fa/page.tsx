"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function Test2FA() {
  const [qr, setQr] = useState("");
  const [token, setToken] = useState("");

  const handleSetup = async () => {
    const res = await fetch("/api/auth/2fa/setup", {
      method: "POST",
    });
    const data = await res.json();

    const qrImage = await QRCode.toDataURL(data.otpauth_url);
    setQr(qrImage);
  };

  const handleVerify = async () => {
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>2FA Test</h1>

      <button onClick={handleSetup}>
        Enable 2FA
      </button>

      {qr && (
        <div>
          <p>Scan this QR code:</p>
          <img src={qr} alt="QR Code" />
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter token"
          />
          <button onClick={handleVerify}>
            Verify Token
          </button>
        </div>
      )}
    </div>
  );
}