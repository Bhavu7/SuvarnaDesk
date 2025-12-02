// components/InvoiceQRCode.tsx
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MdContentCopy, MdCheck } from "react-icons/md";

interface InvoiceQRCodeProps {
  data: string;
  size?: number;
  invoiceNumber?: string;
}

const InvoiceQRCode: React.FC<InvoiceQRCodeProps> = ({
  data,
  size = 200,
  invoiceNumber,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-5 text-center shadow-md bg-gray-50 rounded-xl">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">Scan QR Code</h3>

      <p className="max-w-xs mx-auto mb-4 text-sm text-gray-600">
        Scan with your phone's camera to auto-download the invoice
      </p>

      <div className="inline-block p-3 mb-4 bg-white rounded-lg shadow-sm">
        <QRCodeSVG
          value={data}
          size={size}
          level="H"
          includeMargin={true}
          bgColor="#FFFFFF"
          fgColor="#000000"
          imageSettings={{
            src: "/logo-icon.png",
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
      </div>

      {invoiceNumber && (
        <div className="p-2 mb-3 text-sm text-blue-700 rounded-md bg-blue-50">
          Invoice: <strong>{invoiceNumber}</strong>
        </div>
      )}

      <div className="flex flex-col max-w-xs gap-2 mx-auto">
        <button
          onClick={copyToClipboard}
          className={`w-full py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2 text-sm ${
            copied
              ? "bg-green-600 text-white focus:ring-green-500"
              : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
          }`}
        >
          {copied ? (
            <MdCheck className="text-base" />
          ) : (
            <MdContentCopy className="text-base" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <p>• Works on all devices (iOS, Android, Tablet)</p>
        <p>• Works on any network</p>
      </div>
    </div>
  );
};

export default InvoiceQRCode;
