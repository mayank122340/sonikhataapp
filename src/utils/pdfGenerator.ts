import html2canvas from 'html2canvas';
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

    // 2. Convert Canvas to PNG Blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        window.print();
        return;
      }

      // Create Image File for WhatsApp Attachment
      const imageFile = new File([blob], `${fileName}.png`, { type: 'image/png' });

      // Clean phone number for WhatsApp
      let phone = customer.phone.replace(/[^0-9]/g, '');
      if (phone.length === 10) {
        phone = '91' + phone;
      }

      const shareText = `📄 *Tax Invoice Bill Statement from ${tenant.shopName}*\n\nNamaste ${customer.name}, your visual bill is here:`;

      // 3. Native Mobile Web Share API with Visual Bill Image File
      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        try {
          await navigator.share({
            files: [imageFile],
            title: `${tenant.shopName} Bill Invoice`,
            text: shareText
          });
          return;
        } catch (shareErr) {
          console.log('Mobile share cancelled or fallback triggered');
        }
      }

      // 4. Fallback: Save Bill & Open WhatsApp Chat Directly
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setTimeout(() => {
        const textMsg = encodeURIComponent(shareText);
        window.open(`https://wa.me/${phone}?text=${textMsg}`, '_blank');
      }, 500);

    }, 'image/png');

  } catch (e) {
    console.error('Bill capture error:', e);
    window.print();
  }
};
