import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { supabase } from "./supabase";

const qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  data: "",
  qrOptions: { errorCorrectionLevel: "H" },
});

export default function App() {
  const qrRef = useRef(null);

  /* ---------------- QR DATA ---------------- */
  const [qrType, setQrType] = useState("text");
  const [text, setText] = useState("https://google.com");
  const [imageQR, setImageQR] = useState("");
  const [audioQR, setAudioQR] = useState("");
  const [videoQR, setVideoQR] = useState("");

  /* ---------------- STYLE ---------------- */
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dotStyle, setDotStyle] = useState("rounded");
  const [eyeStyle, setEyeStyle] = useState("rounded");

  /* ---------------- LOGO ---------------- */
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoShape, setLogoShape] = useState("square");
  const [logoSize, setLogoSize] = useState(0.3);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    qrCode.append(qrRef.current);
  }, []);

  /* ---------------- UPDATE QR ---------------- */
  useEffect(() => {
    let data = "";
    if (qrType === "text") data = text;
    if (qrType === "image") data = imageQR;
    if (qrType === "audio") data = audioQR;
    if (qrType === "video") data = videoQR;

    qrCode.update({
      data,
      image: logo,
      dotsOptions: { color: fgColor, type: dotStyle },
      cornersSquareOptions: { type: eyeStyle },
      backgroundOptions: { color: bgColor },
      imageOptions: {
        margin: 6,
        imageSize: logoSize,
        crossOrigin: "anonymous",
      },
    });
  }, [
    qrType,
    text,
    imageQR,
    audioQR,
    videoQR,
    fgColor,
    bgColor,
    dotStyle,
    eyeStyle,
    logo,
    logoSize,
  ]);

  /* ---------------- SUPABASE UPLOAD ---------------- */
  const uploadToSupabase = async (file, folder) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("qr-files")
      .upload(path, file);

    if (error) {
      alert("Upload failed");
      return null;
    }

    return supabase.storage
      .from("qr-files")
      .getPublicUrl(path).data.publicUrl;
  };

  const handleImageQRUpload = async (e) => {
    const url = await uploadToSupabase(e.target.files[0], "images");
    if (url) setImageQR(url);
  };

  const handleAudioQRUpload = async (e) => {
    const url = await uploadToSupabase(e.target.files[0], "audio");
    if (url) setAudioQR(url);
  };

  const handleVideoQRUpload = async (e) => {
    const url = await uploadToSupabase(e.target.files[0], "videos");
    if (url) setVideoQR(url);
  };

  /* ---------------- LOGO SHAPE ---------------- */
  const processLogo = (file, shape) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        canvas.width = shape === "rectangle" ? size * 1.4 : size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();

        if (shape === "circle") {
          ctx.arc(canvas.width / 2, canvas.height / 2, size / 2, 0, Math.PI * 2);
        } else {
          ctx.rect(0, 0, canvas.width, canvas.height);
        }

        ctx.clip();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
    });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    setLogo(await processLogo(file, logoShape));
  };

  useEffect(() => {
    if (!logoFile) return;
    processLogo(logoFile, logoShape).then(setLogo);
  }, [logoShape]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-[1000px] rounded-xl shadow-lg flex p-6 gap-6">

        {/* CONTROLS */}
        <div className="w-1/2 space-y-3">
          <h1 className="text-2xl font-bold">QR Editor</h1>

          <select value={qrType} onChange={(e) => setQrType(e.target.value)}>
            <option value="text">Text / URL</option>
            <option value="image">Image</option>
            <option value="audio">Audio (MP3)</option>
            <option value="video">Video (MP4)</option>
          </select>

          {qrType === "text" && (
            <input value={text} onChange={(e) => setText(e.target.value)} />
          )}

          {qrType === "image" && (
            <input type="file" accept="image/*" onChange={handleImageQRUpload} />
          )}

          {qrType === "audio" && (
            <input type="file" accept="audio/mpeg" onChange={handleAudioQRUpload} />
          )}

          {qrType === "video" && (
            <input type="file" accept="video/mp4" onChange={handleVideoQRUpload} />
          )}

          <hr />

          <label>Foreground</label>
          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />

          <label>Background</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />

          <select value={dotStyle} onChange={(e) => setDotStyle(e.target.value)}>
            <option value="rounded">Rounded</option>
            <option value="dots">Dots</option>
            <option value="classy">Classy</option>
            <option value="square">Square</option>
          </select>

          <select value={eyeStyle} onChange={(e) => setEyeStyle(e.target.value)}>
            <option value="rounded">Rounded Eyes</option>
            <option value="square">Square Eyes</option>
            <option value="extra-rounded">Extra Rounded</option>
          </select>

          <hr />

          <input type="file" accept="image/*" onChange={handleLogoUpload} />

          <select value={logoShape} onChange={(e) => setLogoShape(e.target.value)}>
            <option value="square">Square Logo</option>
            <option value="rectangle">Rectangle Logo</option>
            <option value="circle">Circle Logo</option>
          </select>

          <label>Logo Size</label>
          <input
            type="range"
            min="0.15"
            max="0.5"
            step="0.05"
            value={logoSize}
            onChange={(e) => setLogoSize(e.target.value)}
          />

          <button
            onClick={() => qrCode.download({ extension: "png" })}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Download QR
          </button>
        </div>

        {/* PREVIEW */}
        <div className="w-1/2 flex items-center justify-center border rounded-lg">
          <div ref={qrRef} />
        </div>
      </div>
    </div>
  );
}
