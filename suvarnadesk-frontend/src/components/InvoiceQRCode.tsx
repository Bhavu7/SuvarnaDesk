import React from "react";
import { QRCodeSVG } from "qrcode.react";

const InvoiceQRCode = ({ data }: { data: string }) => (
  <div className="inline-block p-2 my-2 bg-white border border-gray-200 rounded">
    <QRCodeSVG value={data} size={150} />
  </div>
);

export default InvoiceQRCode;
