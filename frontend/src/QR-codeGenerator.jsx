import { useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { QrCode } from "lucide-react";
import axios from "axios";
import { useRef } from "react";

const QrCodeGenerator = () => {
    const [input, setInput] = useState("");
    const [qrValue, setQrValue] = useState("");
    const svgRef = useRef(null)
    
    // Generate QR Code
    const generateQR = async(e) => {
        e.preventDefault()

        try{

            
            const response = await axios.post('http://localhost:5000/add-url' , {input} )
            console.log(response)

        }catch{
                console.log('error')
        }

        if (!input.trim()) {
            alert("Please enter a URL or text");
            return;
        }

        setQrValue(input.trim());
    };

    //Download QR code as SVG

    const downloadSvg = () => {
  const svg = svgRef.current;
  if (!svg) return;

  // Serialize the SVG element to a string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);

  // Create a Blob and trigger download
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "qr-code.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up
  URL.revokeObjectURL(url);
};

    // Download QR code as JPG

    const downloadJpg = () => {
        const canvas = document.querySelector("#qr-code canvas")

        if(!canvas) return;

     // Create a temporary canvas with a white background
    // (JPEG has no transparency — without this, transparent areas turn black)

        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        const ctx = tempCanvas.getContext("2d")
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0, tempCanvas.width, tempCanvas.height)
        ctx.drawImage(canvas,0,0)

         // Convert to JPEG (quality: 0 = worst, 1 = best)
         const jpgUrl = tempCanvas.toDataURL("image/jpeg", 1.0)

         const downloadLink = document.createElement("a")
         downloadLink.href = jpgUrl
         downloadLink.download = "qr-code.jpg" 

         document.body.appendChild(downloadLink)
         downloadLink.click()
         document.body.removeChild(downloadLink)

    }

    // Download QR Code as PNG
    const downloadQR = () => {
        const canvas = document.querySelector("#qr-code canvas");

        if (!canvas) return;

        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");

        downloadLink.href = pngUrl;
        downloadLink.download = "qr-code.png";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Download QR Code as PDF
    const downloadPDF = () => {
        const canvas = document.querySelector("#qr-code canvas");

        if (!canvas) return;

        // Convert canvas to image
        const qrImage = canvas.toDataURL("image/png");

        // Create PDF
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // PDF page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();

        // QR Code size in PDF
        const qrSize = 80;

        // Center QR code horizontally
        const x = (pageWidth - qrSize) / 2;
        const y = 50;

        // Add title
        pdf.setFontSize(20);
        pdf.text("QR Code", pageWidth / 2, 30, {
            align: "center",
        });

        // Add QR code
        pdf.addImage(qrImage, "PNG", x, y, qrSize, qrSize);

        
        // Download PDF
        pdf.save("qr-code.pdf");
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex p-3 justify-center items-start px-4">
            <div className="flex gap-10 items-center bg-white rounded-2xl shadow-xl p-8">
            <form className="">

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    QR Code Generator
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Enter a URL or text to generate a QR code
                </p>

                {/* Input */}
                    <div className="mb-5">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL or Text
                    </label>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-0 focus:ring-2 focus:ring-blue-500"
                        />

                        </div>
                {/* Generate Button */}
                <button
                    onClick={generateQR}
                    className="w-full outline-0 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
                    >
                    Generate QR Code
                </button>
                    </form>

                    

                {/* QR Code */}
                {qrValue && (
                    <div className=" text-center">

                        <div
                            id="qr-code"
                            className="flex justify-center bg-white p-2"
                        >
                            <QRCodeSVG
                                 value={qrValue}
                                 size={200}
                                 level="H"
                                 marginSize={2}
                                 ref={svgRef}


                             />
                                    <QRCodeCanvas
                                value={qrValue}
                                size={200}
                                level="H"
                                marginSize={2}
                                style={{ display: "none" }}
                              />
                              

                        </div>
                             <p className="text-gray-500">You can download QR code as: </p>
                        <div className="flex mt-3 gap-2 items-center justify-center">

                        {/* Download PNG */}
                        <button
                            onClick={downloadQR}
                            className="bg-green-600 hover:bg-green-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
                        >
                         PNG
                        </button>
                        <button
                            onClick={downloadJpg}
                            className="bg-yellow-500 hover:bg-yellow-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
                        >
                         JPG
                        </button>
                        <button
                            onClick={downloadSvg}
                            className="bg-gray-500 hover:bg-gray-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
                        >
                         SVG
                        </button>

                        {/* Download PDF */}
                        <button
                            onClick={downloadPDF}
                            className="bg-red-600 hover:bg-red-700 active:scale-98 text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
                        >
                         PDF
                        </button>

                            </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default QrCodeGenerator;