// components/InvoiceQRCode.tsx
import React from "react";
import QRCode from "qrcode.react";

interface InvoiceQRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

const InvoiceQRCode: React.FC<InvoiceQRCodeProps> = ({
  data,
  size = 200,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <QRCode
        value={data}
        size={size}
        level="M" // Error correction level
        includeMargin={true}
        renderAs="svg"
        className="p-2 bg-white border rounded-lg shadow-sm"
      />
      <p className="mt-2 text-xs text-center text-gray-500">
        Scan to download invoice
      </p>
    </div>
  );
};

export default InvoiceQRCode;
