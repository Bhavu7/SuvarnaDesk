// components/InvoiceQRCode.tsx (Enhanced version)
import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface InvoiceQRCodeProps {
  data: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

const InvoiceQRCode: React.FC<InvoiceQRCodeProps> = ({
  data,
  size = 200,
  className = "",
  showLabel = true,
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="p-4 bg-white rounded-lg">
        <QRCodeSVG
          value={data}
          size={size}
          level="M"
          includeMargin={true}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>
      {showLabel && (
        <p className="mt-3 text-sm text-gray-600 text-center font-medium max-w-[200px]">
          Scan QR code to download invoice
        </p>
      )}
    </div>
  );
};

export default InvoiceQRCode;
