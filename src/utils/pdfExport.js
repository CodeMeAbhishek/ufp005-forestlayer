import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (exploredLayers) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(45, 80, 22);
  doc.text('Forest Ecosystem Layers Explorer', 105, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('UFP005 | Environmental Science and Climate Change', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Layer summaries
  doc.setFontSize(16);
  doc.setTextColor(45, 80, 22);
  doc.text('Explored Layers Summary', 20, yPosition);
  yPosition += 10;

  exploredLayers.forEach((layer, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(70, 70, 70);
    doc.text(layer.name, 20, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const splitText = doc.splitTextToSize(layer.description || `Position: ${layer.position}`, 170);
    doc.text(splitText, 20, yPosition);
    yPosition += splitText.length * 5 + 5;
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | UFP005 Environmental Science and Climate Change`,
      105,
      285,
      { align: 'center' }
    );
  }

  doc.save('forest-layers-exploration.pdf');
};

