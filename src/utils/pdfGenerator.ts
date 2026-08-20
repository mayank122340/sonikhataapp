import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Customer, LedgerEntry, TenantConfig } from '../types';

export const generateAndShareRealPdfDocument = async (
  elementId: string,
  customer: Customer,
  tenant: TenantConfig,
  entries: LedgerEntry[]
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Bill document element not found');
    return;
  }

  try {
    // 1. Render High-Resolution Visual Invoice Canvas with fixed windowWidth to ensure 100% full column capture on mobile
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800
    });

    const fileName = `${customer.name.replace(/\s+/g, '_')}_Tax_Invoice`;

    // 2. Generate proper PDF document using jsPDF
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 size width in mm
    const pageHeight = 297; // A4 size height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

    const shareText = `📄 *Tax Invoice Bill Statement from ${tenant.shopName}*\n\nNamaste ${customer.name}, your bill PDF is here:`;

    // 3. Native Mobile Web Share API with Visual Bill PDF File
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `${tenant.shopName} Bill Invoice`,
          text: shareText
        });
        return;
      } catch (shareErr) {
        console.log('Mobile share cancelled or fallback triggered');
      }
    }

    // 4. Fallback: Save PDF File & Open WhatsApp Chat (opens contact selector)
    pdf.save(`${fileName}.pdf`);

    setTimeout(() => {
      const textMsg = encodeURIComponent(shareText);
      window.open(`https://api.whatsapp.com/send?text=${textMsg}`, '_blank');
    }, 500);

  } catch (e) {
    console.error('Bill capture error:', e);
    window.print();
  }
};
