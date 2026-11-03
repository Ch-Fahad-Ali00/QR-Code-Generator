import { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { QrCode, LayoutDashboard } from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getToken, getUser, logout, isAdmin } from "./auth";

const QrCodeGenerator = () => {
    const [input, setInput] = useState("");
    const [qrValue, setQrValue] = useState("");
    const svgRef = useRef(null);
    const navigate = useNavigate();
    const user = getUser();

    const generateQR = async (e) => {
        e.preventDefault();
        if (!input.trim()) {
            alert("Please enter a URL or text");
            return;
        }

        try {
            await axios.post(
                "http://localhost:5000/add-url",
                { input },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
        } catch (error) {
            console.log("error", error);
            if (error.response?.status === 401) {
                logout();
                navigate("/");
                return;
            }
        }
        setQrValue(input.trim());
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const downloadSvg = () => {
        const svg = svgRef.current;
        if (!svg) return;
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "qr-code.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    const downloadJpg = () => {
        const canvas = document.querySelector("#qr-code canvas");
        if (!canvas) return;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);
        const jpgUrl = tempCanvas.toDataURL("image/jpeg", 1.0);
        const downloadLink = document.createElement("a");
        downloadLink.href = jpgUrl;
        downloadLink.download = "qr-code.jpg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const downloadQR = () => {
        const canvas = document.querySelector("#qr-code canvas");
        if (!canvas) return;
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "qr-code.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const downloadPDF = () => {
        const canvas = document.querySelector("#qr-code canvas");
        if (!canvas) return;
        const qrImage = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const qrSize = 80;
        const x = (pageWidth - qrSize) / 2;
        const y = 50;
        pdf.setFontSize(20);
        pdf.text("QR Code", pageWidth / 2, 30, { align: "center" });
        pdf.addImage(qrImage, "PNG", x, y, qrSize, qrSize);
        pdf.save("qr-code.pdf");
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center">
            
            {/* 🟢 Full Width Navbar */}
            <div className="w-full flex justify-between items-center bg-white shadow-md px-8 py-4 mb-8">
                <div className="flex items-center gap-2 text-gray-700">
                    <QrCode className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-xl">QR Generator</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        {user?.name} ({user?.role})
                    </span>

                    {/* Dashboard Button - Only visible to Admins */}
                    {isAdmin() && (
                        <Link 
                            to="/admin" 
                            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg transition active:scale-95"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                    )}

                    <button 
                        onClick={handleLogout} 
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg active:scale-98 transition cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Container (Centered) */}
            <div className="flex flex-col md:flex-row gap-10 items-center bg-white rounded-2xl shadow-xl p-8 mx-4">
                <form>
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">QR Code Generator</h1>
                    <p className="text-center text-gray-500 mb-8">Enter a URL or text to generate a QR code</p>
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL or Text</label>
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="https://example.com" 
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-0 focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                    <button 
                        onClick={generateQR} 
                        className="w-full outline-0 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
                    >
                        Generate QR Code
                    </button>
                </form>

                {qrValue && (
                    <div className="text-center mt-8 md:mt-0">
                        <div id="qr-code" className="flex justify-center bg-white p-2">
                            <QRCodeSVG value={qrValue} size={200} level="H" marginSize={2} ref={svgRef} />
                            <QRCodeCanvas value={qrValue} size={200} level="H" marginSize={2} style={{ display: "none" }} />
                        </div>
                        <p className="text-gray-500 mt-4">You can download QR code as: </p>
                        <div className="flex flex-wrap mt-3 gap-2 items-center justify-center">
                            <button onClick={downloadQR} className="bg-green-600 hover:bg-green-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer">PNG</button>
                            <button onClick={downloadJpg} className="bg-yellow-500 hover:bg-yellow-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer">JPG</button>
                            <button onClick={downloadSvg} className="bg-gray-500 hover:bg-gray-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer">SVG</button>
                            <button onClick={downloadPDF} className="bg-red-600 hover:bg-red-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer">PDF</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrCodeGenerator;