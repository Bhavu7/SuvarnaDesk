import QRCode from "qrcode";

// Generate a QR code data URL for a string
export const generateQRCode = async (data: string): Promise<string> => {
    return await QRCode.toDataURL(data);
};

// Example usage in an endpoint/controller:
// const qrData = await generateQRCode("Invoice INV-1234, Total: 4999.00");
