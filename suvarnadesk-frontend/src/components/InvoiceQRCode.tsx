import { QRCodeSVG } from "qrcode.react";

export default function InvoiceQRCode({ data }: { data: string }) {
  return (
    <div className="p-2 border rounded">
      <QRCodeSVG value={data} size={150} />
    </div>
  );
}
