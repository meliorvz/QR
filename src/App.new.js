import React, { useState } from "react";
import QRCode from "qrcode.react";
import "./styles/terminal.css";

const buildVCard = (contact) => {
  const namePart = [
    contact.lastName || "",
    contact.firstName || "",
    contact.middleName || "",
    contact.prefix || "",
    contact.suffix || ""
  ].join(";");

  const homeAddress = contact.adrHomeStreet ||
    contact.adrHomeCity ||
    contact.adrHomeRegion ||
    contact.adrHomePostalCode ||
    contact.adrHomeCountry
    ? `ADR;TYPE=HOME:;;${contact.adrHomeStreet || ""};${contact.adrHomeCity || ""};${contact.adrHomeRegion || ""};${contact.adrHomePostalCode || ""};${contact.adrHomeCountry || ""}`
    : "";

  const workAddress = contact.adrWorkStreet ||
    contact.adrWorkCity ||
    contact.adrWorkRegion ||
    contact.adrWorkPostalCode ||
    contact.adrWorkCountry
    ? `ADR;TYPE=WORK:;;${contact.adrWorkStreet || ""};${contact.adrWorkCity || ""};${contact.adrWorkRegion || ""};${contact.adrWorkPostalCode || ""};${contact.adrWorkCountry || ""}`
    : "";

  const phoneLines = [];
  if (contact.phoneMobile) phoneLines.push(`TEL;TYPE=CELL:${contact.phoneMobile}`);
  if (contact.phoneHome) phoneLines.push(`TEL;TYPE=HOME:${contact.phoneHome}`);
  if (contact.phoneWork) phoneLines.push(`TEL;TYPE=WORK:${contact.phoneWork}`);
  if (contact.phoneFax) phoneLines.push(`TEL;TYPE=FAX:${contact.phoneFax}`);

  const emailLines = [];
  if (contact.emailPersonal) emailLines.push(`EMAIL;TYPE=HOME:${contact.emailPersonal}`);
  if (contact.emailWork) emailLines.push(`EMAIL;TYPE=WORK:${contact.emailWork}`);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `N:${namePart}`,
    `FN:${contact.fullName || `${contact.firstName || ""} ${contact.lastName || ""}`.trim()}`,
    contact.nickname ? `NICKNAME:${contact.nickname}` : "",
    contact.title ? `TITLE:${contact.title}` : "",
    contact.org ? `ORG:${contact.org}` : "",
    contact.role ? `ROLE:${contact.role}` : "",
    ...phoneLines,
    ...emailLines,
    homeAddress,
    workAddress,
    contact.bday ? `BDAY:${contact.bday}` : "",
    contact.url ? `URL:${contact.url}` : "",
    contact.note ? `NOTE:${contact.note}` : "",
    "END:VCARD"
  ].filter(Boolean).join("\n");

  return lines;
};

const buildWiFiString = (wifi) => {
  const type = wifi.encryption || "WPA";
  return `WIFI:T:${type};S:${wifi.ssid};P:${wifi.password};;`;
};

function App() {
  const [currentTemplate, setCurrentTemplate] = useState("free");
  const [qrText, setQrText] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [contact, setContact] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    middleName: "",
    prefix: "",
    suffix: "",
    nickname: "",
    title: "",
    org: "",
    role: "",
    phoneMobile: "",
    phoneHome: "",
    phoneWork: "",
    phoneFax: "",
    emailPersonal: "",
    emailWork: "",
    adrHomeStreet: "",
    adrHomeCity: "",
    adrHomeRegion: "",
    adrHomePostalCode: "",
    adrHomeCountry: "",
    adrWorkStreet: "",
    adrWorkCity: "",
    adrWorkRegion: "",
    adrWorkPostalCode: "",
    adrWorkCountry: "",
    bday: "",
    url: "",
    note: ""
  });

  const [wifi, setWifi] = useState({
    ssid: "",
    password: "",
    encryption: "WPA"
  });

  const computeFinalText = () => {
    switch (currentTemplate) {
      case "free": return qrText;
      case "contact": return buildVCard(contact);
      case "wifi": return buildWiFiString(wifi);
      case "phone": return `tel:${qrText}`;
      case "sms": return `smsto:${qrText}`;
      case "email": return `mailto:${qrText}`;
      default: return qrText;
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector(".qr-container canvas");
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-code.png";
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = document.querySelector(".qr-container canvas");
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new window.ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert("QR code copied to clipboard as image!");
    } catch (error) {
      console.error(error);
      alert("Failed to copy image.");
    }
  };

  const textToEncode = computeFinalText() || "";
  const showQR = textToEncode.trim().length > 0;

  return (
    <div className="terminal" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="header">
        <button onClick={() => {
          const templates = ["free", "contact", "wifi", "phone", "sms", "email"];
          const idx = templates.indexOf(currentTemplate);
          const next = templates[(idx + 1) % templates.length];
          setCurrentTemplate(next);
        }}>
          [mode]
        </button>
        <span>$ QR_Generator_{currentTemplate}</span>
        <input
          type="color"
          value={qrColor}
          onChange={(e) => setQrColor(e.target.value)}
          title="Pick QR color"
        />
      </div>

      <div className="content">
        <div className="terminal-line">
          {currentTemplate === "free" && (
            <>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Enter your text:
              </label>
              <textarea
                rows={4}
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Type text to encode..."
                style={{
                  width: "100%",
                  resize: "vertical",
                  fontFamily: "var(--font-family)",
                  fontSize: "1rem"
                }}
              />
            </>
          )}

          {currentTemplate === "wifi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label>
                SSID:
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi((prev) => ({ ...prev, ssid: e.target.value }))}
                  style={{ width: "100%", fontFamily: "var(--font-family)" }}
                />
              </label>
              <label>
                Password:
                <input
                  type="text"
                  value={wifi.password}
                  onChange={(e) => setWifi((prev) => ({ ...prev, password: e.target.value }))}
                  style={{ width: "100%", fontFamily: "var(--font-family)" }}
                />
              </label>
              <label>
                Encryption:
                <select
                  value={wifi.encryption}
                  onChange={(e) => setWifi((prev) => ({ ...prev, encryption: e.target.value }))}
                  style={{ marginLeft: "0.5rem", fontFamily: "var(--font-family)" }}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </label>
            </div>
          )}

          {["phone", "sms", "email"].includes(currentTemplate) && (
            <>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                {currentTemplate === "phone" && "Phone number (e.g. +1234567890):"}
                {currentTemplate === "sms" && "Phone & message (e.g. +1234567890:Hi):"}
                {currentTemplate === "email" && "Email address (e.g. name@example.com):"}
              </label>
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                style={{ width: "100%", fontFamily: "var(--font-family)" }}
              />
            </>
          )}
        </div>

        {showQR && (
          <>
            <div className="qr-container">
              <QRCode
                value={textToEncode}
                size={300}
                fgColor={qrColor}
                bgColor="#ffffff"
                level="L"
                renderAs="canvas"
              />
            </div>
            <div className="button-container">
              <button onClick={handleDownload}>Download QR Code</button>
              <button onClick={handleCopyImage}>Copy to Clipboard</button>
            </div>
          </>
        )}
      </div>

      <div className="footer">
        <span>Switch [mode] to cycle: Free → Contact → WiFi → Phone → SMS → Email</span>
      </div>
    </div>
  );
}

export default App; 