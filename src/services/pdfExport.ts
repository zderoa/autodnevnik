import { jsPDF } from 'jspdf';
import { Vehicle, ServiceRecord, User } from '../types';
import { SERVICE_TYPE_CONFIG } from '../data/constants';

function fmtDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtNum(n?: number): string {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('de-DE');
}

// Clean character sanitization for PDF text compatibility
function cleanText(val?: string | number): string {
  if (val === undefined || val === null) return '';
  return String(val)
    .replace(/č/g, 'c')
    .replace(/Č/g, 'C')
    .replace(/ć/g, 'c')
    .replace(/Ć/g, 'C')
    .replace(/ž/g, 'z')
    .replace(/Ž/g, 'Z')
    .replace(/š/g, 's')
    .replace(/Š/g, 'S')
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'Dj');
}

export function exportServiceSlipPdf(vehicle: Vehicle, service: ServiceRecord, currency: string = 'EUR'): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AUTODNEVNIK // SERVISNI CERTIFIKAT', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Elektronska potvrda o izvrsenom servisnom odrzavanju', margin, 26);
  doc.text(`Broj racuna / naloga: ${cleanText(service.invoiceNumber || 'SRV-' + service.id.slice(-6).toUpperCase())}`, margin, 34);

  const docDate = `Datum izdavanja: ${fmtDate(new Date().toISOString().slice(0, 10))}`;
  doc.text(docDate, pageWidth - margin, 26, { align: 'right' });

  let y = 52;

  // Vehicle Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const vTitle = cleanText(vehicle.customName || `${vehicle.brand} ${vehicle.model}`);
  doc.text(vTitle, margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Godiste: ${vehicle.year}  |  Gorivo: ${cleanText(vehicle.fuelType)}  |  Motor: ${vehicle.cc} ccm (${vehicle.kw} kW / ${vehicle.hp} KS)`, margin + 5, y + 16);
  doc.text(`Broj sasije (VIN): ${cleanText(vehicle.vin || 'Nije unesen')}`, margin + 5, y + 23);
  doc.text(`Registarska oznaka: [${vehicle.country}] ${cleanText(vehicle.plate)}`, margin + 5, y + 30);

  // Mileage badge on the right
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 55, y + 6, 50, 22, 2, 2, 'F');
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text('KILOMETRAZA NA SERVISU', pageWidth - margin - 30, y + 12, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${fmtNum(service.mileage)} km`, pageWidth - margin - 30, y + 22, { align: 'center' });

  y += 44;

  // Service details table
  const cfg = SERVICE_TYPE_CONFIG[service.type];
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(cleanText(service.title || cfg.label), margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Tip zahvata: ${cleanText(cfg.label)}  |  Datum servisa: ${fmtDate(service.date)}`, margin, y + 6);

  y += 14;

  // Checklist of categories
  if (service.categories && service.categories.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('OBAVLJENE OPERACIJE I PROVJERE', margin + 4, y + 5);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    service.categories.forEach((cat) => {
      doc.text(`[X]  ${cleanText(cat)}`, margin + 4, y);
      y += 5.5;
    });

    y += 4;
  }

  // Parts list
  if (service.parts && service.parts.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('UGRAĐENI DIJELOVI I MATERIJAL', margin + 4, y + 5);
    doc.text('KOL.', pageWidth - margin - 40, y + 5, { align: 'right' });
    doc.text('CIJENA', pageWidth - margin - 4, y + 5, { align: 'right' });

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    service.parts.forEach((p) => {
      const partDesc = `${cleanText(p.name)} ${p.brand ? '(' + cleanText(p.brand) + ')' : ''}`;
      doc.setTextColor(30, 41, 59);
      doc.text(partDesc, margin + 4, y);
      doc.setTextColor(100, 116, 139);
      doc.text(`${p.quantity} kom`, pageWidth - margin - 40, y, { align: 'right' });
      doc.text(`${fmtNum(p.price)} ${service.currency || currency}`, pageWidth - margin - 4, y, { align: 'right' });
      y += 5.5;
    });

    y += 4;
  }

  // Workshop & Cost Summary
  y = Math.max(y, 190);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Next service note
  if (service.nextDueMileage || service.nextDueDate) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70); // emerald-800
    const nextMsg = `PREPORUCENI SLJEDECI SERVIS: ${service.nextDueMileage ? fmtNum(service.nextDueMileage) + ' km' : ''} ${service.nextDueDate ? 'ili do ' + fmtDate(service.nextDueDate) : ''}`;
    doc.text(cleanText(nextMsg), margin + 4, y + 8);
    y += 18;
  }

  // Cost total card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth - margin - 65, y, 65, 20, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('UKUPAN IZNOS SERVISA', pageWidth - margin - 32.5, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${fmtNum(service.cost)} ${service.currency || currency}`, pageWidth - margin - 32.5, y + 14, { align: 'center' });

  // Workshop details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Serviser: ${cleanText(service.servicer || 'Ovlasteni auto servis')}`, margin, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  if (service.servicerCity) doc.text(`Lokacija: ${cleanText(service.servicerCity)}`, margin, y + 11);
  if (service.servicerPhone) doc.text(`Kontakt telefon: ${cleanText(service.servicerPhone)}`, margin, y + 16);

  if (service.notes) {
    y += 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Napomene servisera:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(cleanText(service.notes), margin, y + 5);
  }

  // Signature and Stamp lines at the bottom
  const bottomY = 265;
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(margin, bottomY, margin + 60, bottomY);
  doc.line(pageWidth - margin - 60, bottomY, pageWidth - margin, bottomY);

  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Potpis i pecat servisera', margin + 12, bottomY + 5);
  doc.text('Potpis vlasnika vozila', pageWidth - margin - 48, bottomY + 5);

  doc.text('Generisano kroz AutoDnevnik digitalnu servisnu platformu.', pageWidth / 2, 285, { align: 'center' });

  const filename = `Servis_${cleanText(vehicle.brand)}_${cleanText(vehicle.model)}_${service.date}.pdf`;
  doc.save(filename);
}

export function exportVehicleBookletPdf(vehicle: Vehicle, services: ServiceRecord[], currency: string = 'EUR'): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 48, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DIGITALNA SERVISNA KNJIZICA', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Zvanicna hronoloska evidencija radova, servisa i odrzavanja vozila', margin, 28);
  doc.text(`ID Dosijea: ${vehicle.id.toUpperCase()}  |  Izdato: ${fmtDate(new Date().toISOString().slice(0, 10))}`, margin, 36);

  let y = 58;

  // Vehicle Technical Passport Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(cleanText(vehicle.customName || `${vehicle.brand} ${vehicle.model}`), margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 6;
  const col2X = margin + 65;
  const col3X = margin + 125;

  doc.text(`Marka i model: ${cleanText(vehicle.brand)} ${cleanText(vehicle.model)}`, col1X, y + 16);
  doc.text(`Godiste: ${vehicle.year}`, col1X, y + 22);
  doc.text(`Karoserija: ${cleanText(vehicle.bodyType || 'Standard')}`, col1X, y + 28);
  doc.text(`Gorivo: ${cleanText(vehicle.fuelType)}`, col1X, y + 34);

  doc.text(`Kubikaza: ${vehicle.cc} ccm`, col2X, y + 16);
  doc.text(`Snaga: ${vehicle.kw} kW (${vehicle.hp} KS)`, col2X, y + 22);
  doc.text(`Mjenjac: ${cleanText(vehicle.transmission)}`, col2X, y + 28);
  doc.text(`Pogon: ${cleanText(vehicle.drivetrain)}`, col2X, y + 34);

  doc.text(`Tablice: [${vehicle.country}] ${cleanText(vehicle.plate)}`, col3X, y + 16);
  doc.text(`Trenutno stanje: ${fmtNum(vehicle.currentMileage)} km`, col3X, y + 22);
  doc.text(`VIN: ${cleanText(vehicle.vin || 'Nije specificiran')}`, col3X, y + 28);
  doc.text(`Registrovan do: ${vehicle.regDate ? fmtDate(vehicle.regDate) : '—'}`, col3X, y + 34);

  y += 46;

  // Summary statistics bar
  const totalCost = services.reduce((acc, s) => acc + (s.cost || 0), 0);
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`UKUPNO SERVISA: ${services.length}`, margin + 8, y + 9);
  doc.text(`UKUPNO ULAGANJE: ${fmtNum(totalCost)} ${currency}`, pageWidth - margin - 8, y + 9, { align: 'right' });

  y += 20;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('HRONOLOGIJA SERVISNIH ZAHVATA', margin, y);
  y += 6;

  if (services.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Nema unesenih servisnih zapisa za ovo vozilo.', margin, y + 10);
  } else {
    // Services table
    services.forEach((s, idx) => {
      // Check page overflow
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Servisna knjižica: ${cleanText(vehicle.brand)} ${cleanText(vehicle.model)} (nastavak)`, margin, y);
        y += 8;
      }

      const cfg = SERVICE_TYPE_CONFIG[s.type];
      const boxHeight = 22 + (s.categories?.length ? 6 : 0);

      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

      // Date and Mileage
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${fmtDate(s.date)}  —  ${fmtNum(s.mileage)} km`, margin + 4, y + 6);

      // Cost badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`${fmtNum(s.cost)} ${s.currency || currency}`, pageWidth - margin - 4, y + 6, { align: 'right' });

      // Title & Servicer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`${cleanText(s.title)} (${cleanText(cfg.label)})`, margin + 4, y + 12);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.text(`Serviser: ${cleanText(s.servicer || 'N/A')} ${s.servicerCity ? '· ' + cleanText(s.servicerCity) : ''} ${s.invoiceNumber ? '· Racun: ' + cleanText(s.invoiceNumber) : ''}`, margin + 4, y + 17);

      if (s.categories && s.categories.length > 0) {
        doc.text(`Stavke: ${cleanText(s.categories.slice(0, 3).join(', '))}${s.categories.length > 3 ? '...' : ''}`, margin + 4, y + 22);
      }

      y += boxHeight + 4;
    });
  }

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('AutoDnevnik // Autenticna digitalna evidencija motornih vozila. Sva prava zadrzana.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  const filename = `Servisna_Knjizica_${cleanText(vehicle.brand)}_${cleanText(vehicle.model)}.pdf`;
  doc.save(filename);
}

export function exportGarageReportPdf(user: User, vehicles: Vehicle[], allServices: ServiceRecord[]): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AUTODNEVNIK // FLOTNI IZVJESTAJ GARAZA', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Korisnik: ${cleanText(user.name)} (${cleanText(user.email)})`, margin, 26);
  doc.text(`Kreirano: ${fmtDate(new Date().toISOString().slice(0, 10))}`, margin, 32);

  const totalCost = allServices.reduce((sum, s) => sum + (s.cost || 0), 0);

  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`PREGLED REGISTROVANIH VOZILA (${vehicles.length})`, margin, y);

  y += 8;

  vehicles.forEach((v) => {
    const vServices = allServices.filter((s) => s.vehicleId === v.id);
    const vTotal = vServices.reduce((sum, s) => sum + (s.cost || 0), 0);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanText(v.customName || `${v.brand} ${v.model}`), margin + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`[${v.country}] ${cleanText(v.plate)}  |  ${v.year} god.  |  ${v.cc} ccm  |  ${cleanText(v.fuelType)}  |  ${fmtNum(v.currentMileage)} km`, margin + 5, y + 14);
    doc.text(`Zabiljezeno servisa: ${vServices.length}  |  Ukupno ulozeno: ${fmtNum(vTotal)} ${user.settings.currency || 'EUR'}`, margin + 5, y + 20);

    y += 28;
  });

  y += 6;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`UKUPNO ULOZENO U ODRZAVANJE SVIH VOZILA:`, margin + 8, y + 10);
  doc.text(`${fmtNum(totalCost)} ${user.settings.currency || 'EUR'}`, pageWidth - margin - 8, y + 10, { align: 'right' });

  const filename = `Garaza_Izvjestaj_${cleanText(user.name)}.pdf`;
  doc.save(filename);
}
