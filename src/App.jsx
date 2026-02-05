import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { supabase } from "./supabase";
import { 
  FiUpload, 
  FiDownload, 
  FiEye, 
  FiInfo, 
  FiType, 
  FiImage, 
  FiMusic, 
  FiVideo, 
  FiFileText,
  FiSettings,
  FiEdit2,
  FiSquare,
  FiCircle,
  FiLink
} from "react-icons/fi";

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
  const [pdfQR, setPdfQR] = useState("");

  /* ---------------- STYLE ---------------- */
  const [fgColor, setFgColor] = useState("#1e3a8a"); // Dark Blue
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
    
    if (qrType === "text") {
      data = text;
    } else if (qrType === "image") {
      data = imageQR;
    } else if (qrType === "audio") {
      data = audioQR;
    } else if (qrType === "video") {
      data = videoQR;
    } else if (qrType === "pdf") {
      data = pdfQR;
    }

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
    pdfQR,
    fgColor,
    bgColor,
    dotStyle,
    eyeStyle,
    logo,
    logoSize,
  ]);

  /* ---------------- SIMPLE UPLOAD FUNCTION ---------------- */
  const uploadToSupabase = async (file, folder) => {
    if (!file) return null;
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      // Upload file
      const { data, error } = await supabase.storage
        .from('qr-files')
        .upload(filePath, file);
      
      if (error) {
        console.error('Upload error:', error);
        alert(`Upload failed: ${error.message}`);
        return null;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('qr-files')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('Upload exception:', error);
      alert(`Upload error: ${error.message}`);
      return null;
    }
  };

  /* ---------------- FILE UPLOAD HANDLERS ---------------- */
  const handleImageQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file is too large. Maximum size is 5MB.");
      return;
    }
    
    const url = await uploadToSupabase(file, "images");
    if (url) {
      setImageQR(url);
    }
  };

  const handleAudioQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      alert("Please select an audio file (MP3 recommended)");
      return;
    }
    
    const url = await uploadToSupabase(file, "audio");
    if (url) {
      setAudioQR(url);
    }
  };

  const handleVideoQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4')) {
      alert("Please select a video file (MP4 recommended)");
      return;
    }
    
    const url = await uploadToSupabase(file, "videos");
    if (url) {
      setVideoQR(url);
    }
  };

  const handlePdfQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert("Please select a PDF file");
      return;
    }
    
    const url = await uploadToSupabase(file, "pdfs");
    if (url) {
      setPdfQR(url);
    }
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
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file for the logo");
      return;
    }
    
    setLogoFile(file);
    setLogo(await processLogo(file, logoShape));
  };

  useEffect(() => {
    if (!logoFile) return;
    processLogo(logoFile, logoShape).then(setLogo);
  }, [logoShape]);

  /* ---------------- DOWNLOAD QR ---------------- */
  const handleDownload = () => {
    if (!qrType) {
      alert("Please select a QR type first");
      return;
    }
    
    let hasData = false;
    if (qrType === "text" && text.trim()) hasData = true;
    if (qrType === "image" && imageQR) hasData = true;
    if (qrType === "audio" && audioQR) hasData = true;
    if (qrType === "video" && videoQR) hasData = true;
    if (qrType === "pdf" && pdfQR) hasData = true;
    
    if (!hasData) {
      alert(`Please ${qrType === "text" ? "enter text" : "upload a file"} first`);
      return;
    }
    
    qrCode.download({ extension: "png", name: `qr-code-${Date.now()}` });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-3 md:p-4">
      {/* Header with Logo and Title */}
      <header className="w-full max-w-6xl px-3 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-8">
          {/* Logo Section - Can be linked */}
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="flex items-center gap-3 no-underline hover:opacity-90 transition-opacity"
              title="SB Jain's QR Generator"
            >
    <div className="w-12 h-12 md:w-16 md:h-16">
      <img 
        src="/Logo.png" 
        alt="SB Jain's Logo" 
        className="w-full h-full object-contain"
      />
    </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                  SB Jain's
                </h1>
                <h2 className="text-xl md:text-2xl font-bold text-blue-800">
                  QR Code Generator
                </h2>
              </div>
            </a>
          </div>

          {/* Tagline */}
          <div className="text-center md:text-right">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 inline-block">
              <p className="text-sm md:text-base text-emerald-800 font-medium">
                Create Professional QR Codes
              </p>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              Supports Images, Audio, Video & PDF
            </p>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="mt-6 md:mt-8 flex justify-center">
          <div className="w-32 h-1 bg-emerald-600 rounded-full"></div>
          <div className="w-4 h-1 bg-blue-600 rounded-full mx-3"></div>
          <div className="w-32 h-1 bg-emerald-600 rounded-full"></div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl px-3 md:px-6">
        <div className="bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row p-4 md:p-6 gap-4 md:gap-6 border border-gray-200">
          
          {/* CONTROLS */}
          <div className="w-full lg:w-1/2 space-y-4 md:space-y-6">
            {/* Content Settings Card */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-300">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <FiSettings className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900">Content Settings</h3>
              </div>
            
              {/* QR Type Selection */}
              <div className="mb-4 md:mb-5">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                  QR Code Type
                </label>
                <select 
                  className="w-full p-2.5 md:p-3.5 text-sm md:text-base border border-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={qrType} 
                  onChange={(e) => setQrType(e.target.value)}
                >
                  <option value="text">
                    <FiType className="inline mr-2" /> Text / URL
                  </option>
                  <option value="image">
                    <FiImage className="inline mr-2" /> Image File
                  </option>
                  <option value="audio">
                    <FiMusic className="inline mr-2" /> Audio File
                  </option>
                  <option value="video">
                    <FiVideo className="inline mr-2" /> Video File
                  </option>
                  <option value="pdf">
                    <FiFileText className="inline mr-2" /> PDF Document
                  </option>
                </select>
              </div>

              {/* Content Input */}
              {qrType === "text" && (
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Text / URL
                  </label>
                  <input 
                    className="w-full p-2.5 md:p-3.5 text-sm md:text-base border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter URL or text..."
                  />
                </div>
              )}

              {qrType === "image" && (
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-3 md:p-4 text-center hover:border-emerald-500 transition-colors bg-emerald-50">
                    <input 
                      className="w-full cursor-pointer text-xs md:text-sm"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageQRUpload}
                    />
                    <div className="flex items-center justify-center mt-2 text-emerald-700">
                      <FiUpload className="mr-2" />
                      <span className="text-xs md:text-sm font-medium">Click to upload image</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">Max 5MB</p>
                  </div>
                  {imageQR && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-xs md:text-sm text-emerald-800 font-medium">Image uploaded successfully</p>
                    </div>
                  )}
                </div>
              )}

              {["audio", "video", "pdf"].includes(qrType) && (
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Upload {qrType.charAt(0).toUpperCase() + qrType.slice(1)}
                  </label>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 md:p-4 text-center hover:border-blue-500 transition-colors bg-blue-50">
                    <input 
                      className="w-full cursor-pointer text-xs md:text-sm"
                      type="file" 
                      accept={qrType === "audio" ? "audio/*" : qrType === "video" ? "video/*" : ".pdf,application/pdf"}
                      onChange={qrType === "audio" ? handleAudioQRUpload : qrType === "video" ? handleVideoQRUpload : handlePdfQRUpload}
                    />
                    <div className="flex items-center justify-center mt-2 text-blue-700">
                      <FiUpload className="mr-2" />
                      <span className="text-xs md:text-sm font-medium">Click to upload {qrType}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Max {qrType === "audio" || qrType === "video" ? "50MB" : "10MB"}
                    </p>
                  </div>
                  {(audioQR || videoQR || pdfQR) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs md:text-sm text-blue-800 font-medium">
                        {qrType.charAt(0).toUpperCase() + qrType.slice(1)} uploaded successfully
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Style Customization Card */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-300">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <FiEdit2 className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900">Style Customization</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Foreground Color
                  </label>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      className="w-10 h-10 md:w-12 md:h-12 border border-gray-400 rounded-lg cursor-pointer"
                      type="color" 
                      value={fgColor} 
                      onChange={(e) => setFgColor(e.target.value)} 
                    />
                    <span className="text-xs md:text-sm font-medium text-blue-900">{fgColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <input 
                      className="w-10 h-10 md:w-12 md:h-12 border border-gray-400 rounded-lg cursor-pointer"
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)} 
                    />
                    <span className="text-xs md:text-sm font-medium text-blue-900">{bgColor}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Dot Style
                  </label>
                  <select 
                    className="w-full p-2 md:p-3 text-sm border border-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={dotStyle} 
                    onChange={(e) => setDotStyle(e.target.value)}
                  >
                    <option value="rounded">Rounded</option>
                    <option value="dots">Dots</option>
                    <option value="classy">Classy</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Eye Style
                  </label>
                  <select 
                    className="w-full p-2 md:p-3 text-sm border border-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={eyeStyle} 
                    onChange={(e) => setEyeStyle(e.target.value)}
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logo Options Card */}
            <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-300">
              <div className="flex items-center mb-3 md:mb-4">
                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <FiSquare className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-900">Logo Options</h3>
              </div>
              
              <div className="mb-3 md:mb-4">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                  Upload Logo
                </label>
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-3 md:p-4 text-center hover:border-emerald-500 transition-colors bg-emerald-50">
                  <input 
                    className="w-full cursor-pointer text-xs md:text-sm"
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                  />
                  <div className="flex items-center justify-center mt-2 text-emerald-700">
                    <FiUpload className="mr-2" />
                    <span className="text-xs md:text-sm font-medium">Add logo to QR code</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">Recommended: Transparent PNG</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Logo Shape
                  </label>
                  <select 
                    className="w-full p-2 md:p-3 text-sm border border-gray-400 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={logoShape} 
                    onChange={(e) => setLogoShape(e.target.value)}
                  >
                    <option value="square">
                      <FiSquare className="inline mr-2" /> Square
                    </option>
                    <option value="rectangle">
                      <FiSquare className="inline mr-2 transform rotate-45" /> Rectangle
                    </option>
                    <option value="circle">
                      <FiCircle className="inline mr-2" /> Circle
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                    Logo Size: <span className="text-emerald-700 font-bold">{(logoSize * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer"
                    type="range"
                    min="0.15"
                    max="0.5"
                    step="0.05"
                    value={logoSize}
                    onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span className="text-emerald-600">Small</span>
                    <span className="text-blue-600">Medium</span>
                    <span className="text-emerald-600">Large</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 md:py-4 rounded-xl text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <FiDownload className="mr-2 text-lg" />
              Download QR Code
            </button>
          </div>

          {/* PREVIEW - QR CENTERED */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50">
            <div className="text-center mb-4 md:mb-6">
              <div className="flex items-center justify-center mb-1 md:mb-2">
                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center mr-2">
                  <FiEye className="text-white" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">QR Code Preview</h3>
              </div>
              <p className="text-sm md:text-base text-gray-600">Scan to test your QR code</p>
            </div>
            
            {/* QR Code Container - CENTERED */}
            <div className="p-4 md:p-5 bg-white rounded-xl shadow-sm w-full max-w-xs md:max-w-md mx-auto flex items-center justify-center min-h-[350px]">
              <div ref={qrRef} className="mx-auto" />
            </div>
            
            {/* Content Info */}
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white rounded-xl border border-blue-200 w-full">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center mr-2">
                  <FiInfo className="text-white text-sm" />
                </div>
                <h4 className="font-bold text-blue-900">QR Content</h4>
              </div>
              <div className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs md:text-sm font-medium text-gray-800 break-words">
                  {qrType === "text" && text}
                  {qrType === "image" && imageQR && "Image URL Generated"}
                  {qrType === "audio" && audioQR && "Audio URL Generated"}
                  {qrType === "video" && videoQR && "Video URL Generated"}
                  {qrType === "pdf" && pdfQR && "PDF URL Generated"}
                  {!text && !imageQR && !audioQR && !videoQR && !pdfQR && "Enter content above to generate QR code"}
                </p>
              </div>
              
              <div className="mt-3 p-2 md:p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs md:text-sm text-emerald-800">
                  <span className="font-medium">Tip:</span> Scan this QR code with any smartphone camera or QR scanner app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Logo Link */}
      <footer className="w-full max-w-6xl px-3 md:px-6 mt-6 md:mt-8">
        <div className="border-t border-gray-300 pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <a 
                href="/" 
                className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity"
              >
    <div className="w-8 h-8">
      <img 
        src="/Logo.png" 
        alt="SB Jain's Logo" 
        className="w-full h-full object-contain"
      />
    </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">SB Jain's QR Generator</p>
                  <p className="text-xs text-gray-600">Professional QR Code Creation</p>
                </div>
              </a>
            </div>

            {/* Info */}
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-gray-700">
                Files securely stored in Supabase Cloud
              </p>
              <div className="flex justify-center md:justify-end gap-3 mt-1">
                <span className="text-xs text-emerald-600 font-medium">• Secure</span>
                <span className="text-xs text-blue-600 font-medium">• Fast</span>
                <span className="text-xs text-emerald-600 font-medium">• Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}