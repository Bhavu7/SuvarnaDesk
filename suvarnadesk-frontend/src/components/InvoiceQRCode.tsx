import React from "react";
import QRCode from "qrcode.react";

interface Props {
  data: string;
}

export default function InvoiceQRCode({ data }: Props) {
  return (
    <div className="p-2 border rounded">
      <QRCode value={data} size={150} />
    </div>
  );
}
