// components/admin/MemoOrders/MemoOrderPrint.jsx

import React, { useState } from "react";

const COMPANY = {
  name: "FS Interprises",
  address: "Your Business Address Here",
  phone: "+91 XXXXXXXXXX",
  email: "info@fs-interprises.com",
  gstin: "GSTIN Number",
};

const MemoOrderPrint = ({ order }) => {
  const [printing, setPrinting] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    if (printing) return;

    setPrinting(true);

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setPrinting(false);
      alert("Please allow popups for printing.");
      return;
    }

    const itemRows = order.items
      .map((item, index) => {
        const price = item.price ?? 0;
         

        return `
          <tr style="background:${
            index % 2 === 0 ? "#f9f9f9" : "#ffffff"
          }">
            <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:12px">
              ${item.productId?.productName || "Product N/A"}
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:12px">
              ${item.quantity}
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:12px">
              ₹${price.toFixed(2)}
            </td>
          </tr>
        `;
      })
      .join("");

    const totalPrice = order.items.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );


    const billType =
      order.billType === "SPECIAL PRICE"
        ? "ESTIMATE"
        : "INVOICE";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${COMPANY.name}</title>
        <style>
          * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
          }
          
          body { 
            font-family: 'Courier New', Courier, monospace; 
            color: #222; 
            padding: 24px 18px; 
            max-width: 80mm; 
            margin: 0 auto;
            font-size: 12px;
            line-height: 1.5;
          }
          
          /* Receipt-style header */
          .header { 
            text-align: center; 
            margin-bottom: 16px; 
            border-bottom: 2px dashed #333;
            padding-bottom: 12px;
          }
          
          .company-name { 
            font-size: 18px; 
            font-weight: 800; 
            letter-spacing: 1px;
            margin: 0;
          }
          
          .company-sub { 
            font-size: 10px; 
            color: #555; 
            line-height: 1.6;
            margin: 2px 0;
          }
          
          .divider { 
            border: none; 
            border-top: 1px dashed #999; 
            margin: 12px 0; 
          }
          
          .divider-thick { 
            border: none; 
            border-top: 2px solid #222; 
            margin: 10px 0; 
          }
          
          .invoice-title { 
            font-size: 14px; 
            font-weight: 700; 
            text-align: center;
            margin: 8px 0;
            letter-spacing: 2px;
          }
          
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 4px 12px; 
            margin-bottom: 12px; 
            font-size: 11px;
            padding: 8px 0;
            border-bottom: 1px dashed #ccc;
          }
          
          .info-grid .label { 
            color: #666; 
            font-weight: 600;
          }
          
          .info-grid .value { 
            font-weight: 600; 
          }
          
          .section-title { 
            font-size: 11px; 
            font-weight: 700; 
            margin: 10px 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 6px 0 12px 0;
            font-size: 11px;
          }
          
          thead { 
            border-bottom: 2px solid #222;
          }
          
          thead th { 
            padding: 6px 4px; 
            text-align: left; 
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          thead th:nth-child(2) { 
            text-align: center; 
          }
          
          thead th:nth-child(3), 
          thead th:nth-child(4) { 
            text-align: right; 
          }
          
          tbody td { 
            padding: 6px 4px; 
            border-bottom: 1px dotted #ddd;
          }
          
          tbody td:nth-child(2) { 
            text-align: center; 
          }
          
          tbody td:nth-child(3), 
          tbody td:nth-child(4) { 
            text-align: right; 
          }
          
          .total-row td { 
            padding: 8px 4px; 
            font-weight: 700; 
            border-top: 2px solid #222;
            font-size: 13px;
          }
          
          .total-row td:first-child { 
            text-align: right; 
          }
          
          .total-row td:nth-child(2) { 
            text-align: center; 
          }
          
          .total-row td:nth-child(3), 
          .total-row td:nth-child(4) { 
            text-align: right; 
          }
          
          .badge { 
            display: inline-block; 
            padding: 2px 8px; 
            border-radius: 3px; 
            font-size: 10px; 
            font-weight: 700; 
          }
          
          .badge-completed { 
            background: #d1fae5; 
            color: #065f46; 
          }
          
          .badge-pending { 
            background: #fef3c7; 
            color: #92400e; 
          }
          
          .badge-cancelled { 
            background: #fee2e2; 
            color: #991b1b; 
          }
          
          .customer-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 12px;
            font-size: 11px;
            padding: 8px 0;
            border-bottom: 1px dashed #ccc;
            margin-bottom: 8px;
          }
          
          .customer-details .label { 
            color: #666; 
          }
          
          .footer { 
            margin-top: 16px; 
            font-size: 10px; 
            color: #888; 
            text-align: center; 
            border-top: 1px dashed #ccc; 
            padding-top: 12px;
            line-height: 1.8;
          }
          
          .barcode-placeholder {
            text-align: center;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            letter-spacing: 4px;
          }
          
          @media print { 
            body { 
              padding: 12px 10px; 
            }
            .no-print { 
              display: none; 
            }
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <div class="company-name">${COMPANY.name}</div>
          <div class="company-sub">${COMPANY.address}</div>
          <div class="company-sub">${COMPANY.phone} | ${COMPANY.email}</div>
          <div class="company-sub">GSTIN: ${COMPANY.gstin}</div>
        </div>

        <div class="divider-thick"></div>

        <!-- TITLE -->
        <div class="invoice-title">${billType}</div>
        <div style="text-align:center;font-size:10px;color:#666;margin-bottom:8px;">
          #${order._id?.slice(-8) || "N/A"} | ${new Date(order.createdAt).toLocaleDateString("en-IN", { 
            day: "2-digit", 
            month: "short", 
            year: "numeric" 
          })}
        </div>

        <div class="divider"></div>

        <!-- CUSTOMER DETAILS (Compact for thermal printer) -->
        <div class="customer-details">
          <div>
            <span class="label">Customer:</span> 
            ${order.customerName || order.userId?.username || "Guest"}
          </div>
          <div>
            <span class="label">Mobile:</span> 
            ${order.mobileNo || "N/A"}
          </div>
          ${order.gstNo ? `<div><span class="label">GSTIN:</span> ${order.gstNo}</div>` : ""}
          <div>
            <span class="label">Bill Type:</span> 
            ${order.billType || "Regular"}
          </div>
        </div>

        <!-- ITEMS -->
        <div class="section-title">📦 Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2">TOTAL</td>
              <td>₹${totalPrice.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    };

    printWindow.onafterprint = () => {
      printWindow.close();
      setPrinting(false);
    };

    setTimeout(() => {
      setPrinting(false);
    }, 5000);
  };

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        background: "#2196F3",
        color: "#fff",
        fontWeight: 600,
        cursor: printing ? "not-allowed" : "pointer",
        opacity: printing ? 0.7 : 1,
      }}
    >
      {printing ? "Printing..." : "🖨️ Print Receipt"}
    </button>
  );
};

export default MemoOrderPrint;