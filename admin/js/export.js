/*
 * PDF (A4) and Excel export for every screen and report.
 * A report is { title, subtitle, filename, kpis: [[label, value]], sections: [{ title, head, rows, foot, right: [colIdx] }] }.
 * PDFs use jsPDF + AutoTable, Excel files use SheetJS; both are bundled in vendor/ so export works offline.
 */
(function (root) {
  // Company profile (Settings → Company profile & payments), set by the app as PRIMEFIT_PROFILE.
  const DEF = { name: 'The Prime Fit', tagline: 'Transform Today, Thrive Tomorrow', phone: '+91 92051 36303', website: 'www.theprimefit.in', instagram: 'https://www.instagram.com/theprimefit_', youtube: 'https://www.youtube.com/@ThePrimeFit' };
  const prof = () => {
    const x = root.PRIMEFIT_PROFILE || root.PRIMEFIT_SOCIAL || {};
    const out = { ...DEF };
    Object.keys(x).forEach((k) => { if (x[k] != null && String(x[k]).trim() !== '') out[k] = String(x[k]).trim(); });
    return out;
  };
  // Patient documents (slips, invoices, OPD slips) carry this note unless Settings has the clinic's own wording.
  // Wording written for clinics in India; the clinic can replace the short notes in Settings → Company profile.
  // Have your own legal adviser review it for your practice.
  const PATIENT_NOTE = 'Medico-legal note: Services, products and diet plans are provided under professional guidance and are not a substitute for diagnosis or treatment by your doctor. Results vary from person to person; no cure or specific result is promised (Drugs & Magic Remedies (Objectionable Advertisements) Act, 1954). Prescription medicines are supplied only on a valid prescription of a Registered Medical Practitioner (Drugs & Cosmetics Act, 1940). Health supplements are not meant to diagnose, treat, cure or prevent any disease (FSS Act, 2006). Report any side effect at once. Your data is processed under the Digital Personal Data Protection Act, 2023.';
  const DIGITAL_NOTE = 'This is a digitally generated document under the Information Technology Act, 2000. No signature is required.';
  const TERMS = 'Fees for consultations and programmes once started are not refundable; opened or used products cannot be returned, except for a defective or wrongly supplied product reported within 48 hours. Your rights under the Consumer Protection Act, 2019 are not affected. Prices include applicable GST. Subject to the jurisdiction of courts where the clinic is located.';
  /**
   * Patient information, consent and terms (A4), written for India. Each part names the law it follows.
   * {title, text} items; '•' starts a bullet line.
   */
  const LEGAL = [
    ['1. About our services', 'We offer nutrition counselling, diet plans, weight-management and wellness programmes, clinic (OPD) and online consultations, and related products. Our services are not emergency care. In an emergency call 112 or go to the nearest hospital.'],
    ['2. Medical supervision and prescription medicines', '• Medicines, including injectable weight-management medicines, are prescribed, supplied and administered only by or under a Registered Medical Practitioner, on a valid prescription, as required by the National Medical Commission Act, 2019, the NMC (Registered Medical Practitioner Professional Conduct) Regulations, 2023 and the Drugs and Cosmetics Act, 1940 and Rules, 1945 (Schedule H / H1).\n• A diet plan or nutrition advice is not a medical prescription. Do not stop or change any medicine without your doctor.'],
    ['3. Your health information', 'I confirm that I have told the clinic my full medical history, present illnesses, medicines, allergies, surgeries, and whether I am pregnant, breastfeeding or planning pregnancy. I will inform the clinic at once of any change, and of any side effect or unusual symptom, which may also be reported under the Pharmacovigilance Programme of India.'],
    ['4. Results and risks', 'Results differ from person to person and depend on body type, health, medicines, diet, activity and following the advice. No cure or specific result is promised, in line with the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 and the Consumer Protection Act, 2019. Testimonials and before-and-after pictures show individual results only. Possible effects such as nausea, acidity, weakness, dizziness, low blood sugar, constipation or allergy have been explained to me, and I may ask questions at any time.'],
    ['5. Health supplements and protein products', 'Supplements and protein products sold by the clinic are from FSSAI-licensed manufacturers and follow the Food Safety and Standards Act, 2006 and the FSS (Health Supplements, Nutraceuticals ...) Regulations, 2022. They are not intended to diagnose, treat, cure or prevent any disease. Check the label for allergens and use only as advised.'],
    ['6. Online consultations', 'Online consultations follow the Telemedicine Practice Guidelines, 2020. By booking or joining an online consultation I give my consent to it. The practitioner may ask me to visit in person when an examination is needed. Some medicines cannot be prescribed online.'],
    ['7. Privacy and data protection', 'The clinic collects my name, contact details, age, measurements, health information, photos (if I agree) and payment records only to provide care, plans, invoices, reminders and follow-up, and to meet legal duties. My data is processed with my consent under the Digital Personal Data Protection Act, 2023, and protected with reasonable security practices under the Information Technology Act, 2000 and its SPDI Rules, 2011. It is not sold. It is shared only with the treating team, service providers working for the clinic, or when the law requires. Medical records are kept for at least 3 years as required by NMC regulations. I may ask to see, correct or erase my data, withdraw consent, or raise a grievance with the contact given below; withdrawal does not affect care already given or records the law requires us to keep.'],
    ['8. Calls and WhatsApp messages', 'I agree to receive calls, SMS and WhatsApp messages about my appointments, plans, follow-ups and offers. I can stop promotional messages at any time by replying STOP or telling the clinic (TRAI TCCCPR, 2018).'],
    ['9. Fees, invoices and refunds', 'Fees are as told before the service. Tax invoices follow the Central Goods and Services Tax Act, 2017. Fees for a consultation or programme once started are not refundable; opened or used products cannot be returned, except a defective or wrongly supplied product reported within 48 hours. My rights under the Consumer Protection Act, 2019 are not affected.'],
    ['10. Minors', 'For a person below 18 years, a parent or legal guardian gives this consent under the Indian Contract Act, 1872 and the DPDP Act, 2023, and should be present at consultations.'],
    ['11. Law and jurisdiction', 'This consent is governed by the laws of India. Any dispute is subject to the jurisdiction of the courts where the clinic is located. Grievances are acknowledged within 48 hours and resolved within 30 days.'],
  ];
  const reportNote = (p) => `Confidential: computer-generated report for internal use of ${p.legalName || p.name}. Figures are as recorded in the app at the time of export.`;
  const handleOf = (url, fb) => { const m = String(url || '').replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop(); return m ? (m.startsWith('@') ? m : `@${m}`) : fb; };
  function followLine() {
    const x = prof();
    return ['Follow us', `Instagram ${handleOf(x.instagram, '@theprimefit_')}`, `YouTube ${handleOf(x.youtube, '@ThePrimeFit')}`, x.website, x.phone].filter(Boolean).join('  |  ');
  }
  const contactLine = (p) => [p.phone, p.whatsapp && p.whatsapp !== p.phone ? `WhatsApp ${p.whatsapp}` : '', p.email, p.website].filter(Boolean).join('  |  ');
  const idLine = (p) => [p.gstin ? `GSTIN ${p.gstin}` : '', p.regNo ? `Reg. ${p.regNo}` : ''].filter(Boolean).join('  |  ');
  const LOGO = 'data:image/png;base64,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';
  const LOGO_IMG = typeof Image !== 'undefined' ? Object.assign(new Image(), { src: LOGO }) : null;
  const NAVY = [31, 42, 43];
  const BRAND = [1, 91, 83];
  const INK = [27, 36, 37];
  const MUTED = [90, 104, 102];
  const ZEBRA = [242, 247, 246];
  const GOLD = [196, 156, 82];
  const LOGO_W = 46; const LOGO_H = 15; // logo aspect 3.08 : 1

  /** Letterhead on white: logo left, title and company lines right, teal and gold rules below. Returns the y under it. */
  function letterhead(doc, W, M, title, lines, top) {
    const t = top || 6;
    try { doc.addImage(LOGO, 'PNG', M, t, LOGO_W, LOGO_H); } catch (_) { /* logo optional */ }
    doc.setTextColor(...BRAND); doc.setFont('helvetica', 'bold'); doc.setFontSize(title.length > 22 ? 12.5 : 14.5);
    doc.text(pdfText(title), W - M, t + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(7.4);
    let y = t + 9.6;
    lines.filter(Boolean).forEach((ln, i) => { if (i === 0) { doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK); } doc.text(doc.splitTextToSize(pdfText(ln), W / 2 + 10)[0], W - M, y, { align: 'right' }); doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); y += 3.6; });
    y = Math.max(y - 1.5, t + LOGO_H + 2.5);
    doc.setFillColor(...BRAND); doc.rect(M, y, W - 2 * M, 0.9, 'F');
    doc.setFillColor(...GOLD); doc.rect(M, y + 1.4, W - 2 * M, 0.3, 'F');
    return y + 1.7;
  }
  /** Footer on every page: gold hairline, address and contact, a small-print note, follow line and page number. */
  /** The small-print note lines under the footer (up to 6), in the size they are printed at. */
  function noteLines(doc, W, M, note) {
    if (!note) return [];
    const fs = doc.getFontSize(); doc.setFont('helvetica', 'italic'); doc.setFontSize(5.6);
    const out = doc.splitTextToSize(pdfText(note), W - 2 * M).slice(0, 6);
    doc.setFontSize(fs); return out;
  }
  /** Height the footer takes, so pages stop their content above it. */
  const footH = (doc, W, M, note) => 13 + noteLines(doc, W, M, note).length * 2.4;
  function footband(doc, W, H, M, note, n, total) {
    const p = prof();
    const notes = noteLines(doc, W, M, note);
    const top = H - 13 - notes.length * 2.4;
    doc.setFillColor(...GOLD); doc.rect(M, top, W - 2 * M, 0.3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK);
    doc.text(pdfText([p.legalName || p.name, p.address].filter(Boolean).join('  ·  ')).slice(0, 150), M, top + 3.6);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(6.6);
    doc.text(pdfText([contactLine(p), idLine(p)].filter(Boolean).join('  |  ')).slice(0, 170), M, top + 6.7);
    if (n) doc.text(`Page ${n} of ${total}`, W - M, top + 3.6, { align: 'right' });
    doc.setFont('helvetica', 'italic'); doc.setFontSize(5.6); doc.setTextColor(120, 128, 126);
    notes.forEach((ln, i) => doc.text(ln, M, top + 9.4 + i * 2.4));
    doc.setFillColor(...BRAND); doc.rect(0, H - 4.6, W, 4.6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(255, 255, 255);
    doc.text(pdfText(followLine()), W / 2, H - 1.6, { align: 'center' });
  }

  // The built-in PDF fonts have no ₹ or some symbols; replace them with plain equivalents.
  const pdfText = (v) => String(v == null ? '' : v).replace(/₹/g, 'Rs ').replace(/[−–—]/g, '-').replace(/[✓✔]/g, 'Yes')
    .replace(/…/g, '...').replace(/[^\x00-\xFF]/g, '');

  function save(filename, mime, base64, blob) {
    if (root.AndroidBridge && root.AndroidBridge.saveBase64) { root.AndroidBridge.saveBase64(filename, mime, base64); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    // In a browser, a saved PDF also opens in a new tab (on Android the app opens it after saving).
    if (/pdf/.test(mime)) { try { root.open(a.href, '_blank', 'noopener'); } catch (_) { /* pop-up blocked */ } }
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }

  function pdf(report, clinic) {
    const { jsPDF } = root.jspdf;
    const widest = Math.max(0, ...report.sections.map((s) => s.head.length));
    const landscape = widest > 7;
    const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 12;
    const when = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const p = prof();
    const header = () => letterhead(doc, W, M, report.title, [clinic || p.legalName || p.name, contactLine(p)]);
    const footer = (n, total) => footband(doc, W, H, M, report.note || reportNote(p), n, total);

    header();
    let y = 33;
    doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    // Info strip: period, prepared by, generated time, section count.
    doc.setFillColor(...ZEBRA); doc.roundedRect(M, y - 4.5, W - 2 * M, 10, 2, 2, 'F');
    doc.setFillColor(...BRAND); doc.rect(M, y - 4.5, 1.4, 10, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK);
    doc.text(pdfText(report.subtitle || ''), M + 4, y + 1.8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...MUTED);
    doc.text(pdfText(`${report.by ? `Prepared by ${report.by} · ` : ''}${report.sections.length} section${report.sections.length === 1 ? '' : 's'} · ${when}`), W - M - 3, y + 1.6, { align: 'right' });
    y += 11;

    // KPI tiles
    const kpis = report.kpis || [];
    if (kpis.length) {
      const per = landscape ? 5 : 4;
      const gap = 3;
      const bw = (W - 2 * M - gap * (per - 1)) / per;
      kpis.forEach(([label, value], i) => {
        const col = i % per; const row = Math.floor(i / per);
        const x = M + col * (bw + gap); const by = y + row * 17;
        doc.setFillColor(...ZEBRA); doc.roundedRect(x, by, bw, 14.5, 1.8, 1.8, 'F');
        if ((report.alertKpis || []).includes(i)) doc.setFillColor(204, 59, 47); else doc.setFillColor(...BRAND);
        doc.rect(x, by + 2, 0.9, 10.5, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(...MUTED);
        doc.text(pdfText(label).toUpperCase(), x + 3.5, by + 5.2, { maxWidth: bw - 5 });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...INK);
        doc.text(pdfText(value), x + 3.5, by + 11.5, { maxWidth: bw - 5 });
      });
      y += Math.ceil(kpis.length / per) * 17 + 3;
    }

    report.sections.forEach((s) => {
      if (y > H - 46) { doc.addPage(); header(); y = 33; }
      // Section heading: tinted band, brand edge, record count on the right.
      doc.setFillColor(230, 242, 240); doc.roundedRect(M, y, W - 2 * M, 8.5, 1.5, 1.5, 'F');
      doc.setFillColor(...BRAND); doc.rect(M, y, 1.4, 8.5, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...NAVY);
      doc.text(pdfText(s.title), M + 4, y + 5.8);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...MUTED);
      doc.text(pdfText(s.note || `${s.rows.length} ${s.rows.length === 1 ? 'record' : 'records'}`), W - M - 3, y + 5.6, { align: 'right' });
      const right = {};
      (s.right || []).forEach((i) => { right[i] = { halign: 'right', cellWidth: 'wrap' }; });
      doc.autoTable({
        startY: y + 10,
        head: [s.head.map(pdfText)],
        body: s.rows.length ? s.rows.map((r) => r.map(pdfText)) : [[{ content: 'No records for this selection', colSpan: s.head.length, styles: { halign: 'center', textColor: MUTED } }]],
        foot: s.foot ? [s.foot.map(pdfText)] : undefined,
        theme: 'grid',
        showHead: 'everyPage',
        showFoot: 'lastPage',
        rowPageBreak: 'avoid',
        margin: { left: M, right: M, top: 31, bottom: 21 },
        styles: { font: 'helvetica', fontSize: s.head.length > 9 ? 7 : 8.2, cellPadding: 1.8, lineColor: [217, 228, 226], lineWidth: 0.2, textColor: INK, overflow: 'linebreak' },
        headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', halign: 'left' },
        footStyles: { fillColor: [224, 236, 234], textColor: INK, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: ZEBRA },
        columnStyles: right,
        didParseCell: (d) => {
          if ((d.section === 'head' || d.section === 'foot') && right[d.column.index]) d.cell.styles.halign = 'right';
          if (d.section === 'body' && /ORDER REQUIRED|OVERDUE/.test(String(d.cell.raw))) { d.cell.styles.textColor = [204, 59, 47]; d.cell.styles.fontStyle = 'bold'; }
        },
        didDrawPage: () => { header(); },
        tableLineColor: [217, 228, 226], tableLineWidth: 0.2,
      });
      y = doc.lastAutoTable.finalY + 8;
    });

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) { doc.setPage(i); footer(i, total); }
    const name = `${report.filename}.pdf`;
    const b64 = doc.output('datauristring').split(',')[1];
    save(name, 'application/pdf', b64, doc.output('blob'));
    return name;
  }

  function xlsx(report) {
    const X = root.XLSX;
    const wb = X.utils.book_new();
    const used = {};
    const addSheet = (title, rows) => {
      const ws = X.utils.aoa_to_sheet(rows);
      ws['!cols'] = (rows[0] || []).map((_, c) => ({ wch: Math.min(40, Math.max(8, ...rows.map((r) => String(r[c] == null ? '' : r[c]).length + 2))) }));
      let name = String(title).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet';
      let n = 2;
      while (used[name]) name = `${String(title).slice(0, 28)} ${n++}`;
      used[name] = 1;
      X.utils.book_append_sheet(wb, ws, name);
    };
    if (report.kpis && report.kpis.length) addSheet('Summary', [[report.title, report.subtitle || ''], [], ['Metric', 'Value'], ...report.kpis]);
    report.sections.forEach((s) => addSheet(s.title, [s.head, ...s.rows, ...(s.foot ? [s.foot] : [])]));
    const name = `${report.filename}.xlsx`;
    const b64 = X.write(wb, { bookType: 'xlsx', type: 'base64' });
    const bin = atob(b64); const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    save(name, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', b64, new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    return name;
  }

  /**
   * One continuous JPEG of the whole report (same layout as the PDF), so a phone saves a single
   * picture that is easy to share on WhatsApp. Wide reports get a wider canvas instead of
   * squeezed columns; very long reports stop at the canvas limit and say so.
   */
  function jpeg(report, clinic) {
    const M = 56; const rowH = 46; const MAX_H = 30000;
    const FONT = 'Helvetica, Arial, sans-serif';
    const rgb = (a) => `rgb(${a.join(',')})`;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = `22px ${FONT}`;
    const tw = (t, bold) => { probe.font = `${bold ? 'bold ' : ''}22px ${FONT}`; return probe.measureText(String(t == null ? '' : t)).width; };
    // Natural column widths per section (capped so one long note can't take the whole row).
    const layouts = report.sections.map((s) => {
      const rows = s.rows.length ? s.rows : [['No records for this selection']];
      const widths = s.head.map((h, i) => Math.min(420, Math.max(tw(h, true), ...rows.map((r) => tw(r[i])), ...(s.foot ? [tw(s.foot[i], true)] : [])) + 30));
      return { s, rows, widths, total: widths.reduce((x, y) => x + y, 0) };
    });
    const W = Math.round(Math.min(2600, Math.max(1240, ...layouts.map((l) => l.total + 2 * M))));
    const kpis = report.kpis || [];
    const per = W >= 1800 ? 6 : 4;
    let need = 200 + (report.subtitle ? 40 : 0) + (kpis.length ? Math.ceil(kpis.length / per) * 112 + 20 : 0) + 210;
    layouts.forEach((l) => { need += 70 + rowH * (l.rows.length + 1 + (l.s.foot ? 1 : 0)) + 34; });
    const H = Math.min(MAX_H, Math.ceil(need));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    function roundRect(x, yy, w, h, r) { g.beginPath(); g.moveTo(x + r, yy); g.arcTo(x + w, yy, x + w, yy + h, r); g.arcTo(x + w, yy + h, x, yy + h, r); g.arcTo(x, yy + h, x, yy, r); g.arcTo(x, yy, x + w, yy, r); g.closePath(); }
    const fit = (text, max) => { let t = String(text == null ? '' : text); while (t.length > 1 && g.measureText(t).width > max) t = t.slice(0, -2) + '…'; return t; };
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    const pf = prof();
    try { if (LOGO_IMG && LOGO_IMG.complete) g.drawImage(LOGO_IMG, M, 22, 276, 90); } catch (_) { /* logo optional */ }
    g.textAlign = 'right'; g.fillStyle = rgb(BRAND);
    g.font = `bold 44px ${FONT}`; g.fillText(report.title, W - M, 62);
    g.fillStyle = rgb(INK); g.font = `bold 22px ${FONT}`; g.fillText(clinic || pf.legalName || pf.name, W - M, 96);
    g.fillStyle = rgb(MUTED); g.font = `19px ${FONT}`; g.fillText(contactLine(pf), W - M, 124);
    g.fillStyle = rgb(BRAND); g.fillRect(M, 138, W - 2 * M, 5);
    g.fillStyle = rgb(GOLD); g.fillRect(M, 147, W - 2 * M, 2);
    g.textAlign = 'left';
    let y = 186; let cut = false;
    if (report.subtitle) { g.font = `bold 28px ${FONT}`; g.fillStyle = rgb(INK); g.fillText(report.subtitle, M, y); y += 40; }
    if (kpis.length) {
      const gap = 16; const bw = (W - 2 * M - gap * (per - 1)) / per;
      kpis.forEach(([label, value], i) => {
        const x = M + (i % per) * (bw + gap); const by = y + Math.floor(i / per) * 112;
        g.fillStyle = rgb(ZEBRA); roundRect(x, by, bw, 94, 12); g.fill();
        g.fillStyle = (report.alertKpis || []).includes(i) ? '#cc3b2f' : rgb(BRAND); g.fillRect(x, by + 12, 6, 70);
        g.fillStyle = rgb(MUTED); g.font = `19px ${FONT}`; g.fillText(fit(String(label).toUpperCase(), bw - 30), x + 22, by + 35);
        g.fillStyle = rgb(INK); g.font = `bold 34px ${FONT}`; g.fillText(fit(value, bw - 30), x + 22, by + 78);
      });
      y += Math.ceil(kpis.length / per) * 112 + 20;
    }
    const limit = H - 170;
    layouts.forEach(({ s, rows, widths, total }) => {
      if (cut) return;
      if (y + 70 + rowH * 2 > limit) { cut = true; return; }
      const cols = s.head.length;
      const cw = widths.map((w) => (w * (W - 2 * M)) / total);
      // Section heading: tinted band with the record count.
      g.fillStyle = 'rgb(230,242,240)'; roundRect(M, y, W - 2 * M, 50, 10); g.fill();
      g.fillStyle = rgb(BRAND); g.fillRect(M, y, 8, 50);
      g.fillStyle = rgb(NAVY); g.font = `bold 28px ${FONT}`; g.fillText(s.title, M + 24, y + 34);
      g.textAlign = 'right'; g.font = `20px ${FONT}`; g.fillStyle = rgb(MUTED);
      g.fillText(`${s.rows.length} ${s.rows.length === 1 ? 'record' : 'records'}`, W - M - 18, y + 33); g.textAlign = 'left';
      y += 62;
      const drawRow = (cells, style) => {
        if (y + rowH > limit) { cut = true; return false; }
        let x = M;
        g.fillStyle = style === 'head' ? rgb(NAVY) : style === 'foot' ? 'rgb(224,236,234)' : style === 'alt' ? rgb(ZEBRA) : '#fff';
        g.fillRect(M, y, W - 2 * M, rowH);
        g.strokeStyle = 'rgb(217,228,226)'; g.lineWidth = 1; g.strokeRect(M, y, W - 2 * M, rowH);
        cells.forEach((v, i) => {
          if (i >= cols) return;
          const right = (s.right || []).includes(i);
          const hot = (style === 'body' || style === 'alt') && /ORDER REQUIRED|OVERDUE/.test(String(v));
          g.fillStyle = style === 'head' ? '#fff' : hot ? '#cc3b2f' : rgb(INK);
          g.font = `${style === 'head' || style === 'foot' || hot ? 'bold ' : ''}22px ${FONT}`;
          const t = fit(v, cw[i] - 22);
          g.textAlign = right ? 'right' : 'left';
          g.fillText(t, right ? x + cw[i] - 12 : x + 12, y + 30);
          g.textAlign = 'left';
          x += cw[i];
        });
        y += rowH;
        return true;
      };
      drawRow(s.head, 'head');
      rows.every((r, i) => drawRow(r, i % 2 ? 'alt' : 'body'));
      if (s.foot && !cut) drawRow(s.foot, 'foot');
      y += 34;
    });
    const when = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const fy = Math.min(H - 110, y + 50);
    g.fillStyle = rgb(GOLD); g.fillRect(M, fy - 30, W - 2 * M, 2);
    g.fillStyle = rgb(INK); g.font = `bold 19px ${FONT}`;
    g.fillText([pf.legalName || pf.name, pf.address].filter(Boolean).join('  ·  '), M, fy);
    if (cut) { g.textAlign = 'right'; g.fillStyle = '#cc3b2f'; g.fillText('More rows in the PDF / Excel export', W - M, fy); g.textAlign = 'left'; }
    g.fillStyle = rgb(MUTED); g.font = `17px ${FONT}`; g.fillText(`${[contactLine(pf), idLine(pf)].filter(Boolean).join('  |  ')}  ·  Generated ${when}`, M, fy + 26);
    g.font = `italic 15px ${FONT}`; g.fillStyle = 'rgb(120,128,126)'; g.fillText(fit(report.note || reportNote(pf), W - 2 * M), M, fy + 50);
    g.fillStyle = rgb(BRAND); g.fillRect(0, fy + 64, W, 40);
    g.fillStyle = '#fff'; g.font = `bold 17px ${FONT}`; g.textAlign = 'center'; g.fillText(followLine(), W / 2, fy + 90); g.textAlign = 'left';
    // Crop the unused space at the bottom.
    const outH = Math.min(H, fy + 104);
    let out = c;
    if (outH < H) { out = document.createElement('canvas'); out.width = W; out.height = outH; out.getContext('2d').drawImage(c, 0, 0); }
    const name = `${report.filename}.jpg`;
    const url = out.toDataURL('image/jpeg', 0.9);
    const b64 = url.split(',')[1];
    const bin = atob(b64); const bytes = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
    save(name, 'image/jpeg', b64, new Blob([bytes], { type: 'image/jpeg' }));
    return name;
  }

  /** OPD slip: one A5 page for a clinic visit, with patient details and blank space for the doctor's notes. */
  function opdSlip(d) {
    const { jsPDF } = root.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 9;
    const t = (v) => pdfText(v || '-');
    const pf = prof();
    const top = letterhead(doc, W, M, 'OPD SLIP', [d.clinic || pf.legalName || pf.name, d.address || pf.address, contactLine({ ...pf, phone: d.phone || pf.phone })], 5);
    // Token / date strip
    let y = top + 4;
    doc.setFillColor(...ZEBRA); doc.roundedRect(M, y, W - 2 * M, 13, 2, 2, 'F');
    const cell = (x, label, value) => {
      doc.setFontSize(6.5); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal'); doc.text(pdfText(label).toUpperCase(), x, y + 4.8);
      doc.setFontSize(9.5); doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.text(t(value), x, y + 10);
    };
    const cw = (W - 2 * M) / 4;
    cell(M + 3, 'Token', d.token); cell(M + 3 + cw, 'Date', d.date); cell(M + 3 + 2 * cw, 'Time', d.time); cell(M + 3 + 3 * cw, 'Slip no.', d.slipNo);
    // Patient details
    y += 19;
    const rows = [
      ['Patient', d.patient], ['Mobile', d.mobile], ['Age / Gender', [d.age, d.gender].filter(Boolean).join(' / ')], ['Patient ID', d.patientId],
      ['Doctor', d.doctor], ['Visit', d.mode], ['Service', d.service], ['Fee', d.fee], ['Payment', d.payment],
    ];
    doc.setDrawColor(219, 228, 226);
    rows.forEach(([k, v], i) => {
      const col = i % 2; const x = M + col * ((W - 2 * M) / 2);
      if (col === 0 && i) y += 9.5;
      doc.setFontSize(6.5); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal'); doc.text(pdfText(k).toUpperCase(), x, y);
      doc.setFontSize(9.5); doc.setTextColor(...INK); doc.setFont('helvetica', 'bold');
      doc.text(doc.splitTextToSize(t(v), (W - 2 * M) / 2 - 3)[0], x, y + 4.6);
    });
    y += 9;
    doc.line(M, y, W - M, y);
    // Vitals
    y += 6;
    doc.setFontSize(8); doc.setTextColor(...BRAND); doc.setFont('helvetica', 'bold'); doc.text('VITALS', M, y);
    y += 6; doc.setTextColor(...INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const vit = ['Weight ______ kg', 'Height ______ cm', 'BP ________', 'Pulse ______', 'Sugar ______', 'BMI ______'];
    vit.forEach((v, i) => doc.text(v, M + (i % 3) * ((W - 2 * M) / 3), y + Math.floor(i / 3) * 7));
    y += 13;
    doc.line(M, y, W - M, y);
    // Complaints and Rx area
    y += 6;
    doc.setFontSize(8); doc.setTextColor(...BRAND); doc.setFont('helvetica', 'bold'); doc.text('COMPLAINTS / NOTES', M, y);
    if (d.notes) { doc.setFont('helvetica', 'normal'); doc.setTextColor(...INK); doc.text(doc.splitTextToSize(pdfText(d.notes), W - 2 * M).slice(0, 2), M, y + 5); }
    y += 22;
    doc.setFontSize(16); doc.setTextColor(...BRAND); doc.setFont('times', 'bolditalic'); doc.text('Rx', M, y);
    doc.setDrawColor(236, 241, 240);
    for (let ly = y + 7; ly < H - 42; ly += 8) doc.line(M, ly, W - M, ly);
    // Signature and footer
    doc.setDrawColor(219, 228, 226); doc.line(W - M - 45, H - 36, W - M, H - 36);
    doc.setFontSize(7.5); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal');
    doc.text(pdfText(pf.doctor ? `${pf.doctor}${pf.qualification ? `, ${pf.qualification}` : ''}` : "Doctor's signature"), W - M, H - 32, { align: 'right' });
    footband(doc, W, H, M, pf.disclaimer || PATIENT_NOTE);
    const name = `${d.filename || 'OPD-slip'}.pdf`;
    save(name, 'application/pdf', doc.output('datauristring').split(',')[1], doc.output('blob'));
    return name;
  }

  // Amount in words, Indian numbering (lakh, crore): "Rupees Twelve Thousand Five Hundred Only".
  function inWords(amount) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = (n) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`);
    const three = (n) => [n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred` : '', two(n % 100)].filter(Boolean).join(' ');
    let n = Math.floor(Math.abs(Number(amount) || 0));
    const paise = Math.round((Math.abs(Number(amount) || 0) - n) * 100);
    if (!n && !paise) return 'Rupees Zero Only';
    const parts = [];
    [[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']].forEach(([v, w]) => { if (n >= v) { parts.push(`${v === 10000000 ? three(Math.floor(n / v) % 1000) : two(Math.floor(n / v))} ${w}`); n %= v; } });
    if (n) parts.push(three(n));
    return `Rupees ${parts.join(' ')}${paise ? ` and ${two(paise)} Paise` : ''} Only`;
  }
  const payRows = (p) => [['UPI ID', p.upi], ['Payee', p.payee || (p.upi || p.accountNo ? p.legalName || p.name : '')], ['Bank', p.bankName], ['A/c no.', p.accountNo], ['IFSC', p.ifsc], ['Branch', p.branch]].filter(([, v]) => v);

  /**
   * Patient sales slip / invoice. d = { title, no, date, dateText, patient, mobile, patientId, lines: [{ name, detail, qty, rate, mrp, amount, date }],
   * total, gst, taxable, tax, payMethod, unpaid, by, note }. opts = { format: 'a5' | 'a4' | 'thermal', pay, terms, disclaimer, words } (all on by default).
   */
  function slip(d, opts) {
    const o = { format: 'a5', pay: true, terms: true, disclaimer: true, words: true, ...(opts || {}) };
    const pf = prof();
    const money = (n) => pdfText(`Rs ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`);
    const title = d.title || 'SALES SLIP';
    const note = o.disclaimer ? pf.disclaimer || PATIENT_NOTE : '';
    const paid = !!d.payMethod && !d.unpaid;
    const status = paid ? `PAID · ${d.payMethod}` : d.payMethod ? `PART PAID · ${d.payMethod}` : 'PAYMENT DUE';
    const { jsPDF } = root.jspdf;
    let doc;
    if (o.format === 'thermal') {
      // 80 mm roll: lay out once on a tall page to measure, then again on a page cut to fit.
      const draw = (dc) => {
        const W = 80; const M = 4; let y = 5;
        const c = (t, size, bold, col) => { dc.setFont('helvetica', bold ? 'bold' : 'normal'); dc.setFontSize(size); dc.setTextColor(...(col || INK)); dc.splitTextToSize(pdfText(t), W - 2 * M).forEach((ln) => { dc.text(ln, W / 2, y, { align: 'center' }); y += size * 0.42; }); };
        const dash = () => { dc.setDrawColor(150, 150, 150); dc.setLineDashPattern([0.8, 0.8], 0); dc.line(M, y, W - M, y); dc.setLineDashPattern([], 0); y += 3.4; };
        const lr = (l, r, size, bold) => { dc.setFont('helvetica', bold ? 'bold' : 'normal'); dc.setFontSize(size || 8); dc.setTextColor(...INK); dc.text(pdfText(l), M, y); dc.text(pdfText(r), W - M, y, { align: 'right' }); y += (size || 8) * 0.45; };
        try { dc.addImage(LOGO, 'PNG', W / 2 - 24, y, 48, 15.6); } catch (_) { /* logo optional */ }
        y += 19;
        c(pf.legalName || pf.name, 9, true);
        if (pf.address) c(pf.address, 6.8, false, MUTED);
        c([pf.phone, pf.website].filter(Boolean).join('  |  '), 6.8, false, MUTED);
        if (idLine(pf)) c(idLine(pf), 6.8, false, MUTED);
        y += 1; dash();
        c(title, 10, true, BRAND); y += 0.6;
        lr(`No. ${d.no}`, d.dateText || d.date, 7.5);
        lr(d.patient || '-', d.mobile || '', 8, true);
        if (d.by) lr('Attended by', d.by, 7);
        y += 0.6; dash();
        d.lines.forEach((l) => {
          dc.setFont('helvetica', 'bold'); dc.setFontSize(8); dc.setTextColor(...INK);
          dc.splitTextToSize(pdfText(l.name), W - 2 * M).forEach((ln) => { dc.text(ln, M, y); y += 3.4; });
          if (l.detail) { dc.setFont('helvetica', 'normal'); dc.setFontSize(6.6); dc.setTextColor(...MUTED); dc.text(dc.splitTextToSize(pdfText(l.detail), W - 2 * M)[0], M, y); y += 3; }
          lr(`${l.qty} x ${money(l.rate)}`, money(l.amount), 7.6); y += 0.8;
        });
        dash();
        if (d.gst) { lr('Taxable value', money(d.taxable), 7.4); lr(`GST ${d.gst}% (included)`, money(d.tax), 7.4); }
        lr('TOTAL', money(d.total), 11, true); y += 0.6;
        if (o.words) { dc.setFont('helvetica', 'italic'); dc.setFontSize(6.6); dc.setTextColor(...MUTED); dc.splitTextToSize(inWords(d.total), W - 2 * M).forEach((ln) => { dc.text(ln, M, y); y += 2.9; }); }
        y += 0.8; c(status, 8.5, true, paid ? [20, 138, 94] : [192, 105, 15]);
        if (o.pay && payRows(pf).length) { y += 0.6; dash(); c('PAYMENT DETAILS', 7.4, true, BRAND); payRows(pf).forEach(([k, v]) => lr(k, v, 7)); }
        if (d.note) { y += 0.6; dash(); c(d.note, 7, false); }
        if (o.terms) { y += 0.6; dash(); c(pf.terms || TERMS, 6.2, false, MUTED); }
        if (note) { y += 0.6; c(note, 5.8, false, [120, 128, 126]); }
        y += 1.4; dash(); c(DIGITAL_NOTE, 6.4, true, INK); c(`Thank you · ${followLine()}`, 6, true, BRAND);
        return y + 3;
      };
      const h = draw(new jsPDF({ unit: 'mm', format: [80, 1200] }));
      doc = new jsPDF({ unit: 'mm', format: [80, Math.max(100, Math.ceil(h))] });
      draw(doc);
    } else {
      doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: o.format === 'a4' ? 'a4' : 'a5' });
      const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight();
      const M = o.format === 'a4' ? 14 : 9;
      const big = o.format === 'a4' ? 1.12 : 1;
      const top = letterhead(doc, W, M, title, [pf.legalName || pf.name, pf.address, contactLine(pf), idLine(pf)], 5);
      const foot = H - footH(doc, W, M, note) - 3;
      let y = top + 4;
      // Billed to / slip details
      doc.setFillColor(...ZEBRA); doc.roundedRect(M, y, W - 2 * M, 24 * big, 2, 2, 'F');
      doc.setFillColor(...BRAND); doc.rect(M, y, 1.2, 24 * big, 'F');
      const lab = (t, x, yy) => { doc.setFontSize(6.4 * big); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal'); doc.text(pdfText(t).toUpperCase(), x, yy); };
      const val = (t, x, yy, size) => { doc.setFontSize((size || 9) * big); doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.text(doc.splitTextToSize(pdfText(t || '-'), W / 2 - M - 6)[0], x, yy); };
      const x2 = W / 2 + 4; const x3 = W - M - 4;
      lab('Billed to', M + 4, y + 5.5 * big); val(d.patient, M + 4, y + 11 * big, 11);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2 * big); doc.setTextColor(...INK);
      doc.text(pdfText([d.mobile, d.patientId ? `ID ${String(d.patientId).slice(-6).toUpperCase()}` : ''].filter(Boolean).join('  ·  ')), M + 4, y + 16.5 * big);
      if (d.by) { doc.setFontSize(7 * big); doc.setTextColor(...MUTED); doc.text(pdfText(`Attended by ${d.by}`), M + 4, y + 21 * big); }
      lab(/INVOICE/.test(title) ? 'Invoice no.' : /RECEIPT/.test(title) ? 'Receipt no.' : 'Slip no.', x2, y + 5.5 * big); val(d.no, x2, y + 10.5 * big);
      lab('Date', x2, y + 15.5 * big); val(d.dateText || d.date, x2, y + 20.5 * big);
      doc.setFontSize(7.6 * big); doc.setFont('helvetica', 'bold');
      const pillW = doc.getTextWidth(status) + 6;
      doc.setFillColor(...(paid ? [225, 244, 236] : [253, 236, 220])); doc.roundedRect(x3 - pillW, y + 3, pillW, 6.4, 3, 3, 'F');
      doc.setTextColor(...(paid ? [20, 138, 94] : [192, 105, 15])); doc.text(status, x3 - pillW / 2, y + 7.3, { align: 'center' });
      y += 24 * big + 5;
      const multiDay = new Set(d.lines.map((l) => l.date).filter(Boolean)).size > 1;
      doc.autoTable({
        startY: y, margin: { left: M, right: M, top: top + 4, bottom: H - foot + 4 }, theme: 'plain',
        head: [['#', 'Item / service', 'Qty', 'Rate', 'Amount']],
        body: d.lines.map((l, i) => [String(i + 1), pdfText(l.name) + ([l.detail, multiDay && l.date ? `Date ${l.date}` : ''].filter(Boolean).length ? `\n${pdfText([l.detail, multiDay && l.date ? `Date ${l.date}` : ''].filter(Boolean).join(' · '))}` : ''), String(l.qty), money(l.rate) + (l.mrp && l.mrp > l.rate ? `\nMRP ${money(l.mrp)}` : ''), money(l.amount)]),
        headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold', fontSize: 8.2 * big },
        bodyStyles: { fontSize: 8.2 * big, textColor: INK, cellPadding: 2.4, valign: 'top', lineColor: [226, 234, 232], lineWidth: { bottom: 0.2 } },
        alternateRowStyles: { fillColor: [248, 251, 250] },
        columnStyles: { 0: { cellWidth: 7, textColor: MUTED }, 1: { cellWidth: 'auto' }, 2: { halign: 'center', cellWidth: 11 }, 3: { halign: 'right', cellWidth: 25 }, 4: { halign: 'right', cellWidth: 26, fontStyle: 'bold' } },
        didParseCell: (c) => { if (c.section === 'head' && c.column.index >= 2) c.cell.styles.halign = c.column.index === 2 ? 'center' : 'right'; },
      });
      y = doc.lastAutoTable.finalY + 5;
      const blockH = 30 + (o.pay && payRows(pf).length ? 6 : 0) + (o.terms ? 10 : 0) + (d.note ? 6 : 0) + 18;
      if (y + blockH > foot) { doc.addPage(); letterhead(doc, W, M, title, [pf.legalName || pf.name], 5); y = top + 4; }
      // Totals (right) and payment details (left)
      const tx = W - M - 58; let ty = y;
      const row = (k, v, bold) => { doc.setFontSize((bold ? 11 : 8.2) * big); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setTextColor(...(bold ? INK : MUTED)); doc.text(pdfText(k), tx, ty); doc.setTextColor(...INK); doc.text(v, W - M, ty, { align: 'right' }); ty += bold ? 7 : 5.2; };
      if (d.gst) { row('Taxable value', money(d.taxable)); row(`GST ${d.gst}% (included)`, money(d.tax)); }
      else row(`Items (${d.lines.length})`, money(d.total));
      doc.setFillColor(...GOLD); doc.rect(tx, ty - 2.6, W - M - tx, 0.3, 'F'); ty += 2.4;
      row('Total', money(d.total), true);
      if (o.words) { doc.setFont('helvetica', 'italic'); doc.setFontSize(6.6 * big); doc.setTextColor(...MUTED); doc.splitTextToSize(inWords(d.total), W - M - tx).forEach((ln) => { doc.text(ln, tx, ty - 2); ty += 2.9; }); }
      let py = y - 3.6;
      const pr = o.pay ? payRows(pf) : [];
      if (pr.length) {
        const bw = tx - M - 6; const bh = 7 + pr.length * 4.4;
        doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.roundedRect(M, py, bw, bh, 1.8, 1.8, 'S'); doc.setLineWidth(0.2);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7 * big); doc.setTextColor(...BRAND); doc.text('PAYMENT DETAILS', M + 3, py + 4.6);
        pr.forEach(([k, v], i) => { const yy = py + 9 + i * 4.4; doc.setFont('helvetica', 'normal'); doc.setFontSize(7 * big); doc.setTextColor(...MUTED); doc.text(k, M + 3, yy); doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK); doc.text(doc.splitTextToSize(pdfText(v), bw - 24)[0], M + 20, yy); });
        py += bh + 3;
      }
      y = Math.max(ty, py) + 3;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4 * big); doc.setTextColor(...INK);
      if (d.note) { doc.splitTextToSize(pdfText(d.note), W - 2 * M).slice(0, 2).forEach((ln) => { doc.text(ln, M, y); y += 3.6; }); y += 1; }
      if (o.terms) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8 * big); doc.setTextColor(...BRAND); doc.text('TERMS', M, y); y += 3.2;
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(6.6 * big);
        doc.splitTextToSize(pdfText(pf.terms || TERMS), W - 2 * M - 52).slice(0, 7).forEach((ln) => { doc.text(ln, M, y); y += 2.9; });
      }
      // Digital document: no signature needed.
      const sy = Math.min(foot - 4, Math.max(y + 8, foot - 10));
      doc.setFillColor(...ZEBRA); doc.roundedRect(M, sy - 6, W - 2 * M, 8.5, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2 * big); doc.setTextColor(...BRAND);
      doc.text(pdfText(DIGITAL_NOTE), W / 2, sy - 0.8, { align: 'center' });
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) { doc.setPage(i); footband(doc, W, H, M, note, total > 1 ? i : 0, total); }
    }
    const name = `${d.filename || 'Sales-slip'}.pdf`;
    save(name, 'application/pdf', doc.output('datauristring').split(',')[1], doc.output('blob'));
    return name;
  }
  /**
   * Patient information, consent & terms (A4). d = { patient, mobile, age, date, filename }.
   * Consent is the one patient document that keeps signature lines: the patient's written consent.
   */
  function consent(d) {
    const { jsPDF } = root.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight(); const M = 14;
    const p = prof(); const x = d || {};
    const foot = H - 26;
    let y = letterhead(doc, W, M, 'PATIENT CONSENT & TERMS', [p.legalName || p.name, p.address, contactLine(p), idLine(p)]) + 5;
    const page = (need) => { if (y + need > foot) { doc.addPage(); y = letterhead(doc, W, M, 'PATIENT CONSENT & TERMS', [p.legalName || p.name]) + 5; } };
    // Patient box
    doc.setFillColor(...ZEBRA); doc.roundedRect(M, y, W - 2 * M, 15, 2, 2, 'F');
    doc.setFontSize(8.4); doc.setTextColor(...INK);
    const fld = (lbl, val, fx, fy, w) => { doc.setFont('helvetica', 'bold'); doc.text(lbl, fx, fy); const tx = fx + doc.getTextWidth(lbl) + 2; doc.setFont('helvetica', 'normal'); if (val) doc.text(pdfText(val), tx, fy - 0.3); else { doc.setDrawColor(...MUTED); doc.setLineWidth(0.2); doc.line(tx, fy + 0.6, fx + w, fy + 0.6); } };
    fld('Patient name:', x.patient, M + 4, y + 6, 100); fld('Age:', x.age, M + 110, y + 6, 26); fld('Date:', x.date, M + 142, y + 6, 40);
    fld('Mobile:', x.mobile, M + 4, y + 12, 70); fld('Doctor / counsellor:', [p.doctor, p.qualification].filter(Boolean).join(', '), M + 80, y + 12, 102);
    y += 21;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...MUTED);
    doc.splitTextToSize('Please read this carefully. Ask us about anything that is not clear before you sign. A copy is given to you.', W - 2 * M).forEach((ln) => { doc.text(ln, M, y); y += 3.6; });
    y += 1.5;
    LEGAL.forEach(([title, text]) => {
      page(14);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.setTextColor(...BRAND); doc.text(pdfText(title), M, y);
      doc.setFillColor(...GOLD); doc.rect(M, y + 1.2, 18, 0.35, 'F'); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.1); doc.setTextColor(...INK);
      String(text).split('\n').forEach((para) => {
        const bullet = para.startsWith('• '); const body = bullet ? para.slice(2) : para;
        doc.splitTextToSize(pdfText(body), W - 2 * M - (bullet ? 4 : 0)).forEach((ln, i) => { page(4); if (bullet && i === 0) doc.text('-', M, y); doc.text(ln, M + (bullet ? 4 : 0), y); y += 3.75; });
        y += 0.8;
      });
      y += 1.8;
    });
    // Grievance contact
    page(16);
    const gr = [p.grievanceName || p.doctor || p.legalName || p.name, p.grievanceEmail || p.email, p.phone].filter(Boolean).join('  |  ');
    doc.setFillColor(251, 246, 234); doc.roundedRect(M, y, W - 2 * M, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.2); doc.setTextColor(138, 100, 24); doc.text('Grievance / data protection contact', M + 4, y + 4.4);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...INK); doc.text(pdfText(gr), M + 4, y + 8.6);
    y += 16;
    // Declaration and signatures
    page(44);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.setTextColor(...BRAND); doc.text('Declaration', M, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.1); doc.setTextColor(...INK);
    doc.splitTextToSize('I have read (or had read to me in a language I understand) and understood the above. I had the chance to ask questions and they were answered. I give my free and informed consent to the consultation, diet plan and programme, and to the processing of my personal data as described.', W - 2 * M).forEach((ln) => { doc.text(ln, M, y); y += 3.75; });
    y += 12;
    const sig = (lbl, sub, sx, w) => { doc.setDrawColor(...INK); doc.setLineWidth(0.25); doc.line(sx, y, sx + w, y); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.8); doc.text(lbl, sx, y + 4); doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(7); doc.text(pdfText(sub), sx, y + 7.4); doc.setTextColor(...INK); };
    const cw = (W - 2 * M - 12) / 3;
    sig('Patient / parent or guardian', 'Name, relation and date', M, cw);
    sig('Witness', 'Name and date', M + cw + 6, cw);
    sig('Doctor / counsellor', [p.doctor, p.regNo ? `Reg. ${p.regNo}` : ''].filter(Boolean).join(', ') || 'Name and registration no.', M + 2 * (cw + 6), cw);
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) { doc.setPage(i); footband(doc, W, H, M, 'Patient copy and clinic copy. Keep this document with your medical records.', total > 1 ? i : 0, total); }
    const name = `${x.filename || 'Patient-consent'}.pdf`;
    save(name, 'application/pdf', doc.output('datauristring').split(',')[1], doc.output('blob'));
    return name;
  }
  /** Patient invoice: the sales slip with the title INVOICE. */
  const invoice = (d, opts) => slip({ title: 'INVOICE', ...d }, opts);

  root.EXPORT = { pdf, xlsx, jpeg, pdfText, opdSlip, invoice, slip, consent, inWords, profile: prof, PATIENT_NOTE, TERMS, LEGAL };
})(window);
