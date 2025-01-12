import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./styles/terminal.css";

const buildVCard = (contact) => {
  const namePart = [
    contact.lastName || "",
    contact.firstName || "",
    "",  // middleName
    "",  // prefix
    ""   // suffix
  ].join(";");

  const homeAddress = contact.adrHomeStreet ||
    contact.adrHomeCity ||
    contact.adrHomeRegion ||
    contact.adrHomePostalCode ||
    contact.adrHomeCountry
    ? `ADR;TYPE=HOME:;;${contact.adrHomeStreet || ""};${contact.adrHomeCity || ""};${contact.adrHomeRegion || ""};${contact.adrHomePostalCode || ""};${contact.adrHomeCountry || ""}`
    : "";

  const phoneLines = [];
  if (contact.phoneMobile) phoneLines.push(`TEL;TYPE=CELL:${contact.phoneMobile}`);
  if (contact.phoneWork) phoneLines.push(`TEL;TYPE=WORK:${contact.phoneWork}`);
  if (contact.whatsapp) phoneLines.push(`TEL;TYPE=WHATSAPP:${contact.whatsapp}`);

  const emailLines = [];
  if (contact.emailPersonal) emailLines.push(`EMAIL;TYPE=HOME:${contact.emailPersonal}`);
  if (contact.emailWork) emailLines.push(`EMAIL;TYPE=WORK:${contact.emailWork}`);

  // Social media fields as URLs
  const socialLines = [];
  if (contact.telegram) socialLines.push(`URL;TYPE=TELEGRAM:https://t.me/${contact.telegram.replace('@', '')}`);
  if (contact.instagram) socialLines.push(`URL;TYPE=INSTAGRAM:https://instagram.com/${contact.instagram.replace('@', '')}`);
  if (contact.wechat) socialLines.push(`X-SOCIALPROFILE;TYPE=WECHAT:${contact.wechat}`);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `N:${namePart}`,
    `FN:${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
    contact.title ? `TITLE:${contact.title}` : "",
    contact.org ? `ORG:${contact.org}` : "",
    ...phoneLines,
    ...emailLines,
    ...socialLines,
    homeAddress,
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
  const [qrColor, setQrColor] = useState("var(--text-color)");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    title: "",
    org: "",
    phoneMobile: "",
    phoneWork: "",
    emailPersonal: "",
    emailWork: "",
    whatsapp: "",
    telegram: "",
    instagram: "",
    wechat: "",
    adrHomeStreet: "",
    adrHomeCity: "",
    adrHomeRegion: "",
    adrHomePostalCode: "",
    adrHomeCountry: "",
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
        <div className="color-picker">
          <span className="color-label">[color]</span>
          <input
            type="color"
            value={qrColor.startsWith("var") ? "#00ff00" : qrColor}
            onChange={(e) => setQrColor(e.target.value)}
            title="Pick QR code color"
          />
        </div>
        <button onClick={() => {
          const templates = ["free", "contact", "wifi"];
          const idx = templates.indexOf(currentTemplate);
          const next = templates[(idx + 1) % templates.length];
          setCurrentTemplate(next);
        }}>
          [mode]
        </button>
        <span>$ QR_Generator_{currentTemplate}</span>
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

          {currentTemplate === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label style={{ flex: 1 }}>
                    First Name:
                    <input
                      type="text"
                      value={contact.firstName}
                      onChange={(e) => setContact(prev => ({ ...prev, firstName: e.target.value }))}
                      style={{ width: "100%", fontFamily: "var(--font-family)" }}
                    />
                  </label>
                  <label style={{ flex: 1 }}>
                    Last Name:
                    <input
                      type="text"
                      value={contact.lastName}
                      onChange={(e) => setContact(prev => ({ ...prev, lastName: e.target.value }))}
                      style={{ width: "100%", fontFamily: "var(--font-family)" }}
                    />
                  </label>
                </div>

                <label>
                  Mobile Phone:
                  <input
                    type="tel"
                    value={contact.phoneMobile}
                    onChange={(e) => setContact(prev => ({ ...prev, phoneMobile: e.target.value }))}
                    style={{ width: "100%", fontFamily: "var(--font-family)" }}
                  />
                </label>

                <label>
                  Email:
                  <input
                    type="email"
                    value={contact.emailPersonal}
                    onChange={(e) => setContact(prev => ({ ...prev, emailPersonal: e.target.value }))}
                    style={{ width: "100%", fontFamily: "var(--font-family)" }}
                  />
                </label>

                <label>
                  Website:
                  <input
                    type="url"
                    value={contact.url}
                    onChange={(e) => setContact(prev => ({ ...prev, url: e.target.value }))}
                    style={{ width: "100%", fontFamily: "var(--font-family)" }}
                  />
                </label>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
                >
                  {showAdvanced ? "[hide advanced]" : "[show advanced]"}
                </button>
              </div>

              {showAdvanced && (
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "0.5rem",
                  border: "1px dashed var(--text-color)",
                  padding: "1rem",
                  marginTop: "0.5rem"
                }}>
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", opacity: 0.7 }}>Social Media</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label>
                        WhatsApp:
                        <input
                          type="tel"
                          value={contact.whatsapp}
                          onChange={(e) => setContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          placeholder="+1234567890"
                        />
                      </label>
                      <label>
                        Telegram:
                        <input
                          type="text"
                          value={contact.telegram}
                          onChange={(e) => setContact(prev => ({ ...prev, telegram: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          placeholder="@username"
                        />
                      </label>
                      <label>
                        Instagram:
                        <input
                          type="text"
                          value={contact.instagram}
                          onChange={(e) => setContact(prev => ({ ...prev, instagram: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          placeholder="@username"
                        />
                      </label>
                      <label>
                        WeChat:
                        <input
                          type="text"
                          value={contact.wechat}
                          onChange={(e) => setContact(prev => ({ ...prev, wechat: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          placeholder="ID"
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", opacity: 0.7 }}>Professional Info</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <label style={{ flex: 1 }}>
                          Title:
                          <input
                            type="text"
                            value={contact.title}
                            onChange={(e) => setContact(prev => ({ ...prev, title: e.target.value }))}
                            style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          />
                        </label>
                        <label style={{ flex: 1 }}>
                          Organization:
                          <input
                            type="text"
                            value={contact.org}
                            onChange={(e) => setContact(prev => ({ ...prev, org: e.target.value }))}
                            style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", opacity: 0.7 }}>Additional Contact</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label>
                        Work Phone:
                        <input
                          type="tel"
                          value={contact.phoneWork}
                          onChange={(e) => setContact(prev => ({ ...prev, phoneWork: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                        />
                      </label>
                      <label>
                        Work Email:
                        <input
                          type="email"
                          value={contact.emailWork}
                          onChange={(e) => setContact(prev => ({ ...prev, emailWork: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", opacity: 0.7 }}>Address</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label>
                        Street:
                        <input
                          type="text"
                          value={contact.adrHomeStreet}
                          onChange={(e) => setContact(prev => ({ ...prev, adrHomeStreet: e.target.value }))}
                          style={{ width: "100%", fontFamily: "var(--font-family)" }}
                        />
                      </label>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <label style={{ flex: 1 }}>
                          City:
                          <input
                            type="text"
                            value={contact.adrHomeCity}
                            onChange={(e) => setContact(prev => ({ ...prev, adrHomeCity: e.target.value }))}
                            style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          />
                        </label>
                        <label style={{ flex: 1 }}>
                          State/Region:
                          <input
                            type="text"
                            value={contact.adrHomeRegion}
                            onChange={(e) => setContact(prev => ({ ...prev, adrHomeRegion: e.target.value }))}
                            style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          />
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <label style={{ flex: 1 }}>
                          Postal Code:
                          <input
                            type="text"
                            value={contact.adrHomePostalCode}
                            onChange={(e) => setContact(prev => ({ ...prev, adrHomePostalCode: e.target.value }))}
                            style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          />
                        </label>
                        <label style={{ flex: 1 }}>
                          Country:
                          <input
                            type="text"
                            value={contact.adrHomeCountry}
                            onChange={(e) => setContact(prev => ({ ...prev, adrHomeCountry: e.target.value }))}
                            style={{ width: "100%", fontFamily: "var(--font-family)" }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", opacity: 0.7 }}>Notes</h4>
                    <textarea
                      value={contact.note}
                      onChange={(e) => setContact(prev => ({ ...prev, note: e.target.value }))}
                      style={{ width: "100%", fontFamily: "var(--font-family)", resize: "vertical" }}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
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
        </div>

        {showQR && (
          <>
            <div className="qr-container">
              <QRCodeSVG
                value={textToEncode}
                size={300}
                fgColor={qrColor.startsWith("var") ? getComputedStyle(document.documentElement).getPropertyValue("--text-color").trim() : qrColor}
                bgColor={getComputedStyle(document.documentElement).getPropertyValue("--background-color").trim()}
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
        <span>Switch [mode] to cycle: Free → Contact → WiFi</span>
      </div>
    </div>
  );
}

export default App; 