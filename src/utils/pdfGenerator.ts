import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ECGSession } from '../types';

interface PDFReportData {
  patientName: string;
  patientId: string;
  session: ECGSession;
}

/**
 * Renders ECG waveform to canvas
 */
const renderECGWaveformToCanvas = (
  samples: number[],
  width: number = 800,
  height: number = 300
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw grid (medical ECG style)
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  const gridSpacing = 20;

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let x = 0; x <= width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  if (samples.length === 0) {
    return canvas;
  }

  // Scale ECG data
  const centerY = height / 2;
  const maxValue = 1024;
  const scale = (height * 0.8) / maxValue;
  
  const samplesToShow = Math.min(samples.length, Math.floor(width / 2));
  const startIndex = Math.max(0, samples.length - samplesToShow);
  const stepX = width / samplesToShow;

  // Draw ECG waveform
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  for (let i = 0; i < samplesToShow; i++) {
    const dataIndex = startIndex + i;
    const value = samples[dataIndex];
    const x = i * stepX;
    const y = centerY - (value - 512) * scale;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Draw baseline
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  return canvas;
};

/**
 * Generates a medical-style ECG PDF report
 */
export const generateECGPDF = async (data: PDFReportData): Promise<void> => {
  const { patientName, patientId, session } = data;

  // Create PDF document (A4 size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ECG REPORT', pageWidth / 2, margin + 10, { align: 'center' });

  // Patient Information Section
  let yPos = margin + 25;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information:', margin, yPos);
  yPos += 8;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Patient Name: ${patientName}`, margin, yPos);
  yPos += 6;
  pdf.text(`Patient ID: ${patientId}`, margin, yPos);
  yPos += 6;
  pdf.text(`Date: ${session.startTime.toLocaleDateString()}`, margin, yPos);
  yPos += 6;
  pdf.text(`Time: ${session.startTime.toLocaleTimeString()}`, margin, yPos);
  yPos += 6;
  pdf.text(`Duration: ${session.duration ? session.duration.toFixed(1) : 'N/A'} seconds`, margin, yPos);
  yPos += 6;
  pdf.text(`Sampling Rate: ${session.samplingRate} Hz`, margin, yPos);
  yPos += 6;
  pdf.text(`Total Samples: ${session.samples.length}`, margin, yPos);

  // Separator
  yPos += 8;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ECG Waveform Section
  pdf.setFont('helvetica', 'bold');
  pdf.text('ECG Waveform:', margin, yPos);
  yPos += 5;

  // Render ECG waveform to canvas
  const waveformCanvas = renderECGWaveformToCanvas(session.samples, 800, 300);
  const waveformImage = waveformCanvas.toDataURL('image/png');

  // Calculate image dimensions to fit page
  const maxImageWidth = contentWidth;
  const maxImageHeight = 80; // mm
  const imageAspectRatio = waveformCanvas.width / waveformCanvas.height;
  let imageWidth = maxImageWidth;
  let imageHeight = imageWidth / imageAspectRatio;

  if (imageHeight > maxImageHeight) {
    imageHeight = maxImageHeight;
    imageWidth = imageHeight * imageAspectRatio;
  }

  // Add waveform image to PDF
  pdf.addImage(
    waveformImage,
    'PNG',
    margin + (contentWidth - imageWidth) / 2,
    yPos,
    imageWidth,
    imageHeight
  );

  yPos += imageHeight + 10;

  // Summary Section
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary:', margin, yPos);
  yPos += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Average Heart Rate: ${session.avgHeartRate || 'N/A'} bpm`, margin, yPos);
  yPos += 6;
  pdf.text(`Signal Quality: ${session.signalQuality || 'N/A'}`, margin, yPos);
  yPos += 6;

  // Heart rate interpretation
  if (session.avgHeartRate) {
    let interpretation = '';
    if (session.avgHeartRate < 60) {
      interpretation = 'Bradycardia (Below normal)';
    } else if (session.avgHeartRate > 100) {
      interpretation = 'Tachycardia (Above normal)';
    } else {
      interpretation = 'Normal sinus rhythm';
    }
    pdf.text(`Interpretation: ${interpretation}`, margin, yPos);
    yPos += 6;
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  pdf.text(
    'This is a medical device report. Consult a healthcare professional for interpretation.',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  // Save PDF
  const fileName = `ECG_Report_${patientName}_${session.startTime.toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

/**
 * Generates PDF from HTML element (alternative method)
 */
export const generatePDFFromHTML = async (
  elementId: string,
  filename: string = 'report.pdf'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;
  const pdfWidth = pageWidth - 20;
  const pdfHeight = pdfWidth / ratio;

  if (pdfHeight > pageHeight) {
    // Multiple pages
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
  } else {
    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
  }

  pdf.save(filename);
};

