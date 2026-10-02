/*
 * PDF (A4) and Excel export for every screen and report.
 * A report is { title, subtitle, filename, kpis: [[label, value]], sections: [{ title, head, rows, foot, right: [colIdx] }] }.
 * PDFs use jsPDF + AutoTable, Excel files use SheetJS; both are bundled in vendor/ so export works offline.
 */
(function (root) {
  const LOGO = 'data:image/jpeg;base64,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';
  const LOGO_IMG = typeof Image !== 'undefined' ? Object.assign(new Image(), { src: LOGO }) : null;
  const NAVY = [10, 47, 85];
  const BRAND = [14, 111, 181];
  const INK = [19, 35, 58];
  const MUTED = [93, 107, 124];
  const ZEBRA = [242, 246, 250];

  // The built-in PDF fonts have no ₹ or some symbols; replace them with plain equivalents.
  const pdfText = (v) => String(v == null ? '' : v).replace(/₹/g, 'Rs ').replace(/[−–—]/g, '-').replace(/[✓✔]/g, 'Yes')
    .replace(/…/g, '...').replace(/[^\x00-\xFF]/g, '');

  const ACCENTS = [[14, 111, 181], [15, 157, 143], [108, 91, 212], [217, 154, 30], [41, 168, 224], [20, 138, 94]];
  const RED = [204, 59, 47];

  // Files are saved one after another (Android can only show one "Save as" screen at a time).
  function save(filename, mime, base64, blob) {
    if (root.AndroidBridge && root.AndroidBridge.saveBase64) { root.AndroidBridge.saveBase64(filename, mime, base64); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  const b64ToBlob = (b64, mime) => {
    const bin = atob(b64); const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };
  const GOLD = [217, 154, 30];
  // Clinic for headers and footers: a name, or { name, address, phone }.
  const clinicOf = (c) => (c && typeof c === 'object' ? { name: c.name || 'Hindivine Healthcare', address: c.address || '', phone: c.phone || '' } : { name: c || 'Hindivine Healthcare', address: '', phone: '' });
  const nowText = () => new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  /**
   * A4 PDF: branded header, report meta line, coloured summary tiles, sections with an accent
   * bar and record count, striped tables with totals, page numbers and credit on every page.
   */
  function pdf(report, clinic) {
    const { jsPDF } = root.jspdf;
    const widest = Math.max(0, ...report.sections.map((s) => s.head.length));
    const landscape = widest > 7;
    const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 12;
    const when = nowText();
    const ci = clinicOf(clinic);
    const name = ci.name;
    const contact = [ci.address, ci.phone ? `Phone ${ci.phone}` : ''].filter(Boolean).join('  |  ');

    const header = (first) => {
      const hh = first ? 32 : 18;
      doc.setFillColor(...NAVY); doc.rect(0, 0, W, hh, 'F');
      doc.setFillColor(...BRAND); doc.rect(0, hh, W, 1.2, 'F');
      doc.setFillColor(...GOLD); doc.rect(0, hh + 1.2, W, 0.5, 'F');
      if (first) {
        doc.setFillColor(255, 255, 255); doc.roundedRect(M, 6.5, 52, 19, 2.5, 2.5, 'F');
        try { doc.addImage(LOGO, 'JPEG', M + 1.8, 7.6, 48.4, 16.5); } catch (_) { /* logo optional */ }
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(17);
        doc.text(pdfText(report.title), W - M, 13.5, { align: 'right' });
        doc.setFontSize(9.5); doc.text(pdfText(name), W - M, 20, { align: 'right' });
        if (contact) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(200, 216, 234); doc.text(pdfText(contact), W - M, 25.5, { align: 'right', maxWidth: W - 2 * M - 60 }); }
      } else {
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text(pdfText(name), M, 11.5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
        doc.text(pdfText(`${report.title}${report.subtitle ? ` · ${report.subtitle}` : ''}`), W - M, 11.5, { align: 'right' });
      }
    };
    const footer = (n, total) => {
      doc.setFillColor(...GOLD); doc.rect(M, H - 13, W - 2 * M, 0.35, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.8); doc.setTextColor(...NAVY);
      doc.text(pdfText(name), M, H - 8.2);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(...MUTED);
      doc.text(pdfText([contact, `${report.title} · generated ${when}${report.preparedBy ? ` by ${report.preparedBy}` : ''}`].filter(Boolean).join('  |  ')), M, H - 4.4, { maxWidth: W - 2 * M - 30 });
      doc.setFillColor(...NAVY); doc.roundedRect(W - M - 24, H - 11.2, 24, 6.4, 3.2, 3.2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.setTextColor(255, 255, 255); doc.text(`Page ${n} / ${total}`, W - M - 12, H - 7, { align: 'center' });
    };

    header(true);
    let y = 41;
    // Info strip: period, records, prepared by, generated
    const recs = report.sections.reduce((a, s) => a + s.rows.length, 0);
    const info = [['REPORT', report.subtitle || report.title], ['RECORDS', `${recs} in ${report.sections.length} section${report.sections.length === 1 ? '' : 's'}`],
      ['PREPARED BY', report.preparedBy || '-'], ['GENERATED', when]];
    const iw = (W - 2 * M) / info.length;
    doc.setFillColor(...ZEBRA); doc.roundedRect(M, y, W - 2 * M, 13, 2.5, 2.5, 'F');
    info.forEach(([l, v], i) => {
      const x = M + i * iw;
      if (i) { doc.setDrawColor(222, 230, 240); doc.setLineWidth(0.3); doc.line(x, y + 2.5, x, y + 10.5); }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4); doc.setTextColor(...MUTED); doc.text(l, x + 4, y + 4.8);
      doc.setFontSize(i ? 8.6 : 9.2); doc.setTextColor(...NAVY); doc.text(pdfText(v), x + 4, y + 10, { maxWidth: iw - 6 });
    });
    y += 19;

    const kpis = report.kpis || [];
    if (kpis.length) {
      const per = landscape ? 5 : 4;
      const gap = 3;
      const bw = (W - 2 * M - gap * (per - 1)) / per;
      kpis.forEach(([label, value], i) => {
        const col = i % per; const row = Math.floor(i / per);
        const x = M + col * (bw + gap); const by = y + row * 18.5;
        const ac = (report.alertKpis || []).includes(i) ? RED : ACCENTS[i % ACCENTS.length];
        doc.setFillColor(...ac.map((c) => Math.round(c + (255 - c) * 0.93))); doc.roundedRect(x, by, bw, 15.5, 2.2, 2.2, 'F');
        doc.setDrawColor(...ac.map((c) => Math.round(c + (255 - c) * 0.7))); doc.setLineWidth(0.25); doc.roundedRect(x, by, bw, 15.5, 2.2, 2.2, 'S');
        doc.setFillColor(...ac); doc.roundedRect(x, by, 1.6, 15.5, 0.8, 0.8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); doc.setTextColor(...MUTED);
        doc.text(pdfText(label).toUpperCase(), x + 4.2, by + 5.4, { maxWidth: bw - 6 });
        doc.setFontSize(12.5); doc.setTextColor(...ac.map((c) => Math.round(c * 0.75)));
        doc.text(pdfText(value), x + 4.2, by + 12.2, { maxWidth: bw - 6 });
      });
      y += Math.ceil(kpis.length / per) * 18.5 + 4;
    }

    report.sections.forEach((s, si) => {
      if (y > H - 55) { doc.addPage(); header(false); y = 26; }
      const ac = /ORDER REQUIRED/i.test(s.title) ? RED : ACCENTS[si % ACCENTS.length];
      doc.setFillColor(...ac); doc.roundedRect(M, y - 1, 2.2, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...NAVY);
      doc.text(pdfText(s.title), M + 5, y + 4.4);
      const tw = doc.getTextWidth(pdfText(s.title));
      doc.setFillColor(...ac.map((c) => Math.round(c + (255 - c) * 0.85))); doc.roundedRect(M + 7 + tw, y, 16, 5.6, 2.8, 2.8, 'F');
      doc.setFontSize(7.5); doc.setTextColor(...ac); doc.text(`${s.rows.length}`, M + 15 + tw, y + 3.9, { align: 'center' });
      if (s.note) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MUTED); doc.text(pdfText(s.note), W - M, y + 4, { align: 'right' }); }
      const right = {};
      (s.right || []).forEach((i) => { right[i] = { halign: 'right' }; });
      doc.autoTable({
        startY: y + 8,
        head: [s.head.map(pdfText)],
        body: s.rows.length ? s.rows.map((r) => r.map(pdfText)) : [[{ content: 'No records for this selection', colSpan: s.head.length, styles: { halign: 'center', textColor: MUTED, fontStyle: 'italic' } }]],
        foot: s.foot ? [s.foot.map(pdfText)] : undefined,
        theme: 'striped',
        showHead: 'everyPage',
        showFoot: 'lastPage',
        rowPageBreak: 'avoid',
        margin: { left: M, right: M, top: 24, bottom: 20 },
        styles: { font: 'helvetica', fontSize: s.head.length > 9 ? 7 : 8.3, cellPadding: { top: 2.1, bottom: 2.1, left: 2.2, right: 2.2 }, textColor: INK, overflow: 'linebreak', lineColor: [226, 233, 241], lineWidth: { bottom: 0.2 } },
        headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', halign: 'left', fontSize: s.head.length > 9 ? 7 : 8.2 },
        footStyles: { fillColor: ac.map((c) => Math.round(c + (255 - c) * 0.85)), textColor: NAVY, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [246, 249, 252] },
        columnStyles: right,
        didParseCell: (d) => {
          if ((d.section === 'head' || d.section === 'foot') && right[d.column.index]) d.cell.styles.halign = 'right';
          if (d.section === 'body' && /ORDER REQUIRED|Not available|Overdue/i.test(String(d.cell.raw))) { d.cell.styles.textColor = RED; d.cell.styles.fontStyle = 'bold'; }
          if (d.section === 'body' && /^(Paid|Completed|Available|Converted)/.test(String(d.cell.raw))) { d.cell.styles.textColor = [20, 138, 94]; d.cell.styles.fontStyle = 'bold'; }
        },
        didDrawPage: () => { if (doc.getCurrentPageInfo().pageNumber > 1) header(false); },
      });
      y = doc.lastAutoTable.finalY + 10;
    });

    if (y < H - 24) { doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(...MUTED); doc.text('- End of report -', W / 2, y - 2, { align: 'center' }); }
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) { doc.setPage(i); footer(i, total); }
    const fname = `${report.filename}.pdf`;
    const b64 = doc.output('datauristring').split(',')[1];
    save(fname, 'application/pdf', b64, b64ToBlob(b64, 'application/pdf'));
    return fname;
  }

  /** OPD slip (A4): clinic header, token, patient and visit details, doctor, clinic, payment, vitals, Rx space, signature. */
  function opdSlip(a, info) {
    const { jsPDF } = root.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight(); const M = 12;
    const clinicName = info.branch || info.clinic;
    // Header
    doc.setFillColor(...NAVY); doc.rect(0, 0, W, 36, 'F');
    doc.setFillColor(...BRAND); doc.rect(0, 36, W, 1.4, 'F');
    doc.setFillColor(217, 154, 30); doc.rect(0, 37.4, W, 0.6, 'F');
    doc.setFillColor(255, 255, 255); doc.roundedRect(M, 7, 58, 21, 3, 3, 'F');
    try { doc.addImage(LOGO, 'JPEG', M + 2, 8.6, 54, 18.4); } catch (_) { /* optional */ }
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.text('OPD SLIP', W - M, 14, { align: 'right' });
    doc.setFontSize(10.5); doc.text(pdfText(clinicName), W - M, 21, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2);
    const contact = [info.address, info.phone ? `Phone ${info.phone}` : ''].filter(Boolean);
    contact.forEach((t, i) => doc.text(pdfText(t), W - M, 26 + i * 4.3, { align: 'right', maxWidth: 110 }));
    if (!contact.length) doc.text('www.hindivine.com', W - M, 26.5, { align: 'right' });
    // Token strip
    let y = 44;
    doc.setFillColor(...ZEBRA); doc.roundedRect(M, y, W - 2 * M, 19, 3, 3, 'F');
    doc.setFillColor(...BRAND); doc.roundedRect(M, y, 34, 19, 3, 3, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.text('TOKEN NO.', M + 17, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text(String(info.token || '-'), M + 17, y + 15, { align: 'center' });
    const strip = [['DATE', info.date], ['TIME', info.time || 'Walk-in'], ['VISIT', info.mode], ['SLIP NO.', info.slipNo || '-']];
    const sw = (W - 2 * M - 38) / strip.length;
    strip.forEach(([l, v], i) => {
      const x = M + 40 + i * sw;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.setTextColor(...MUTED); doc.text(l, x, y + 6.5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...INK); doc.text(pdfText(v), x, y + 13.5, { maxWidth: sw - 3 });
    });
    y += 25;
    // Two panels: patient | visit
    const colW = (W - 2 * M - 6) / 2;
    const panel = (x, title, rows) => {
      let yy = y;
      doc.setFillColor(...BRAND); doc.roundedRect(x, yy, 2.2, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text(title, x + 5, yy + 5);
      yy += 9;
      const top = yy;
      rows.forEach(([k, v], i) => {
        if (i % 2 === 0) { doc.setFillColor(246, 249, 252); doc.rect(x, yy, colW, 8.6, 'F'); }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.setTextColor(...MUTED); doc.text(k, x + 2.5, yy + 5.6);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.setTextColor(...INK);
        const t = doc.splitTextToSize(pdfText(v || '-'), colW - 36);
        doc.text(t[0] + (t.length > 1 ? '...' : ''), x + 34, yy + 5.6);
        yy += 8.6;
      });
      doc.setDrawColor(222, 230, 240); doc.setLineWidth(0.3); doc.roundedRect(x, top, colW, yy - top, 1.5, 1.5);
      return yy;
    };
    const y1 = panel(M, 'Patient details', [['Patient name', a.patientName], ['Mobile', a.mobile], ['Age / Gender', info.ageGender], ['City', info.city],
      ['Patient visit no.', info.visitNo], ['Patient since', info.since]]);
    const y2 = panel(M + colW + 6, 'Visit details', [['Doctor', info.doctor], ['Clinic / branch', clinicName], ['Treatment', a.service || 'Consultation'],
      ['Visit type', info.mode], ['Status', info.status], ['Booked by', a.by || '']]);
    y = Math.max(y1, y2) + 6;
    // Payment strip
    doc.setFillColor(...BRAND); doc.roundedRect(M, y, 2.2, 6.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text('Payment', M + 5, y + 5);
    y += 9;
    const paid = !!a.paid;
    const pay = [['Consultation fee', info.fee], ['Payment status', paid ? 'PAID' : 'UNPAID'], ['Payment method', paid ? (a.payMethod || 'Cash') : '-']];
    const pw = (W - 2 * M) / pay.length;
    pay.forEach(([l, v], i) => {
      const x = M + i * pw;
      if (i === 1) doc.setFillColor(...(paid ? [228, 245, 237] : [253, 236, 234])); else doc.setFillColor(246, 249, 252);
      doc.roundedRect(x + (i ? 1.5 : 0), y, pw - 1.5, 13, 2, 2, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...MUTED); doc.text(l, x + 4, y + 5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      if (i === 1) doc.setTextColor(...(paid ? [20, 138, 94] : RED)); else doc.setTextColor(...INK);
      doc.text(pdfText(v), x + 4, y + 10.6);
    });
    y += 18;
    if (a.link || a.notes) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.setTextColor(...INK);
      const lines = [a.notes ? `Notes / complaint: ${a.notes}` : '', a.link ? `Online meeting link: ${a.link}` : ''].filter(Boolean);
      lines.forEach((t) => { const l = doc.splitTextToSize(pdfText(t), W - 2 * M).slice(0, 2); doc.text(l, M, y + 3); y += l.length * 4.2 + 1.5; });
      y += 2;
    }
    // Vitals
    doc.setFillColor(...BRAND); doc.roundedRect(M, y, 2.2, 6.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text('Vitals', M + 5, y + 5);
    y += 9;
    const vv = info.vitals || {};
    const vit = [['Weight (kg)', vv.weight], ['Height (cm)', vv.height], ['BMI', vv.bmi ? `${vv.bmi}` : ''], ['BP', vv.bp], ['Pulse', vv.pulse], ['Sugar', vv.sugar]];
    const vw = (W - 2 * M) / vit.length;
    vit.forEach(([l, v], i) => {
      const x = M + i * vw + (i ? 1 : 0);
      if (l === 'BMI' && v) { doc.setFillColor(232, 242, 251); doc.roundedRect(x, y, vw - 1, 13, 2, 2, 'F'); }
      doc.setDrawColor(210, 220, 232); doc.roundedRect(x, y, vw - 1, 13, 2, 2);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); doc.setTextColor(...MUTED); doc.text(l, x + 2.5, y + 4.5);
      if (v) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...(l === 'BMI' ? BRAND : INK)); doc.text(pdfText(v), x + 2.5, y + 10.5); }
      if (l === 'BMI' && v && vv.bmiLabel) { doc.setFont('helvetica', 'normal'); doc.setFontSize(6.6); doc.setTextColor(...MUTED); doc.text(pdfText(vv.bmiLabel), x + vw - 3.5, y + 10.5, { align: 'right' }); }
    });
    y += 19;
    // Rx
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(...BRAND); doc.text('Rx', M, y + 5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED); doc.text('Advice / diet / medicines', M + 13, y + 5);
    doc.setDrawColor(228, 235, 243); doc.setLineWidth(0.25);
    for (let ly = y + 13; ly < H - 40; ly += 8.5) doc.line(M, ly, W - M, ly);
    // Next visit + signature
    doc.setDrawColor(...MUTED); doc.setLineWidth(0.3);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.setTextColor(...MUTED);
    doc.text('Next visit:', M, H - 27); doc.line(M + 16, H - 27, M + 70, H - 27);
    doc.line(W - M - 62, H - 29, W - M, H - 29);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK); doc.text(pdfText(info.doctor || 'Doctor / dietitian'), W - M - 31, H - 24, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...MUTED); doc.text('Signature', W - M - 31, H - 20, { align: 'center' });
    // Footer: clinic details only
    doc.setFillColor(...NAVY); doc.rect(0, H - 12, W, 12, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.8);
    doc.text(pdfText([clinicName, info.phone, info.address].filter(Boolean).join('  |  ')), M, H - 5, { maxWidth: W - 2 * M - 50 });
    doc.text(pdfText(`Printed ${nowText()}`), W - M, H - 5, { align: 'right' });
    const fname = `OPD-Slip-${String(a.patientName).replace(/[^A-Za-z0-9]+/g, '-')}-${a.date}.pdf`;
    const b64 = doc.output('datauristring').split(',')[1];
    save(fname, 'application/pdf', b64, b64ToBlob(b64, 'application/pdf'));
    return fname;
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
   * A4 image (JPEG, 1240 × 1754 px ≈ 150 dpi) drawn on a canvas in the same layout as the PDF.
   * Long reports continue on extra images (…-page-2.jpg).
   */
  /**
   * A4 image (JPEG, 1240 px wide ≈ 150 dpi) in the same layout as the PDF. Always ONE file:
   * the report is drawn at full size and fitted onto the A4 page; very long reports become one
   * long A4-width image instead of several files.
   */
  function jpeg(report, clinic) {
    const W = 1240; const A4H = 1754; const M = 56; const ROW = 44; const MAX_H = 15000;
    const rgb = (a) => `rgb(${a.join(',')})`;
    const tint = (a, k) => rgb(a.map((c) => Math.round(c + (255 - c) * k)));
    const kpis = report.kpis || [];
    const sections = report.sections.map((s) => ({ ...s, rows: s.rows.length ? s.rows : [['No records for this selection']] }));
    // Measure first so the canvas has the right size.
    let H = 210 + (report.subtitle ? 50 : 0) + (kpis.length ? Math.ceil(kpis.length / 4) * 112 + 16 : 0) + 100;
    sections.forEach((s) => { H += 60 + (s.rows.length + 1 + (s.foot ? 1 : 0)) * ROW + 30; });
    H = Math.min(Math.max(H, 600), MAX_H);
    const ci = clinicOf(clinic);
    const contact = [ci.address, ci.phone ? `Phone ${ci.phone}` : ''].filter(Boolean).join('  |  ');
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const font = (w, px) => { g.font = `${w} ${px}px Helvetica, Arial, sans-serif`; };
    const rr = (x, yy, w, h, r) => { g.beginPath(); g.moveTo(x + r, yy); g.arcTo(x + w, yy, x + w, yy + h, r); g.arcTo(x + w, yy + h, x, yy + h, r); g.arcTo(x, yy + h, x, yy, r); g.arcTo(x, yy, x + w, yy, r); g.closePath(); };
    const fit = (text, max) => { let t = String(text == null ? '' : text); if (g.measureText(t).width <= max) return t; while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; };
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    // Header
    const grd = g.createLinearGradient(0, 0, W, 0); grd.addColorStop(0, rgb(NAVY)); grd.addColorStop(1, '#0e5a9b');
    g.fillStyle = grd; g.fillRect(0, 0, W, 150);
    g.fillStyle = rgb(BRAND); g.fillRect(0, 150, W, 6); g.fillStyle = rgb(GOLD); g.fillRect(0, 156, W, 3);
    g.fillStyle = '#fff'; rr(M, 28, 270, 94, 14); g.fill();
    try { if (LOGO_IMG && LOGO_IMG.complete) g.drawImage(LOGO_IMG, M + 9, 33, 252, 85); } catch (_) { /* logo optional */ }
    g.textAlign = 'right'; g.fillStyle = '#fff'; font('bold', 46); g.fillText(fit(report.title, 600), W - M, 72);
    font('bold', 24); g.fillText(fit(ci.name, 600), W - M, 106);
    if (contact) { font('normal', 18); g.fillStyle = 'rgb(200,216,234)'; g.fillText(fit(contact, 760), W - M, 134); }
    g.textAlign = 'left';
    let y = 196;
    if (report.subtitle) {
      g.fillStyle = rgb(ZEBRA); rr(M, y - 34, W - 2 * M, 48, 12); g.fill();
      font('bold', 26); g.fillStyle = rgb(NAVY); g.fillText(fit(report.subtitle, 640), M + 18, y - 2);
      font('normal', 19); g.fillStyle = rgb(MUTED); g.textAlign = 'right';
      g.fillText(fit(`${report.preparedBy ? `By ${report.preparedBy} · ` : ''}${nowText()}`, 420), W - M - 18, y - 4); g.textAlign = 'left';
      y += 40;
    }
    if (kpis.length) {
      const per = 4; const gap = 16; const bw = (W - 2 * M - gap * (per - 1)) / per;
      kpis.forEach(([label, value], i) => {
        const x = M + (i % per) * (bw + gap); const by = y + Math.floor(i / per) * 112;
        const ac = (report.alertKpis || []).includes(i) ? RED : ACCENTS[i % ACCENTS.length];
        g.fillStyle = tint(ac, 0.93); rr(x, by, bw, 96, 14); g.fill();
        g.strokeStyle = tint(ac, 0.7); g.lineWidth = 1.5; rr(x, by, bw, 96, 14); g.stroke();
        g.fillStyle = rgb(ac); rr(x, by, 8, 96, 4); g.fill();
        font('bold', 18); g.fillStyle = rgb(MUTED); g.fillText(fit(String(label).toUpperCase(), bw - 36), x + 26, by + 34);
        font('bold', 36); g.fillStyle = rgb(ac.map((v) => Math.round(v * 0.75))); g.fillText(fit(value, bw - 36), x + 26, by + 78);
      });
      y += Math.ceil(kpis.length / per) * 112 + 16;
    }
    let cut = false;
    sections.forEach((s, si) => {
      if (cut) return;
      const ac = /ORDER REQUIRED/i.test(s.title) ? RED : ACCENTS[si % ACCENTS.length];
      g.fillStyle = rgb(ac); rr(M, y, 10, 34, 5); g.fill();
      font('bold', 30); g.fillStyle = rgb(NAVY); g.fillText(s.title, M + 22, y + 27);
      const tw = g.measureText(s.title).width;
      g.fillStyle = tint(ac, 0.85); rr(M + 34 + tw, y + 4, 60, 28, 14); g.fill();
      font('bold', 18); g.fillStyle = rgb(ac); g.textAlign = 'center'; g.fillText(String(report.sections[si].rows.length), M + 64 + tw, y + 24); g.textAlign = 'left';
      y += 50;
      font('normal', 21);
      const cols = s.head.length;
      const widths = s.head.map((h, i) => Math.min(520, Math.max(g.measureText(String(h)).width, ...s.rows.map((r) => g.measureText(String(r[i] == null ? '' : r[i])).width)) + 30));
      const scale = (W - 2 * M) / widths.reduce((a, b) => a + b, 0);
      const cw = widths.map((w) => w * scale);
      const drawRow = (cells, style, i) => {
        if (y + ROW > H - 80) { cut = true; return; }
        g.fillStyle = style === 'head' ? rgb(NAVY) : style === 'foot' ? tint(ac, 0.85) : i % 2 ? 'rgb(246,249,252)' : '#fff';
        if (style === 'head') { rr(M, y, W - 2 * M, ROW, 10); g.fill(); } else g.fillRect(M, y, W - 2 * M, ROW);
        g.fillStyle = 'rgb(226,233,241)'; g.fillRect(M, y + ROW - 1, W - 2 * M, 1);
        let x = M;
        const full = cells.length === 1 && cols > 1;
        cells.forEach((v, k) => {
          if (k >= cols) return;
          const right = (s.right || []).includes(k);
          const txt = String(v == null ? '' : v);
          const hot = style === 'body' && /ORDER REQUIRED|Not available|Overdue/i.test(txt);
          const good = style === 'body' && /^(Paid|Completed|Available|Converted)/.test(txt);
          g.fillStyle = style === 'head' ? '#fff' : hot ? rgb(RED) : good ? 'rgb(20,138,94)' : style === 'foot' ? rgb(NAVY) : rgb(INK);
          font(style === 'body' && !hot && !good ? 'normal' : 'bold', 21);
          const width = full ? W - 2 * M : cw[k];
          const t = fit(txt, width - 24);
          g.textAlign = right ? 'right' : 'left';
          g.fillText(t, right ? x + width - 12 : x + 12, y + 29);
          g.textAlign = 'left';
          x += cw[k];
        });
        y += ROW;
      };
      drawRow(s.head, 'head', 0);
      s.rows.forEach((r, i) => drawRow(r, 'body', i));
      if (s.foot) drawRow(s.foot, 'foot', 0);
      y += 30;
    });
    if (cut) { font('bold', 22); g.fillStyle = rgb(RED); g.fillText('More rows in the PDF / Excel export…', M, H - 92); }
    // Footer
    g.fillStyle = '#fff'; g.fillRect(0, H - 64, W, 64);
    g.fillStyle = rgb(GOLD); g.fillRect(M, H - 62, W - 2 * M, 2);
    font('bold', 19); g.fillStyle = rgb(NAVY); g.fillText(fit(ci.name, 420), M, H - 26);
    font('normal', 17); g.fillStyle = rgb(MUTED); g.textAlign = 'right';
    g.fillText(fit([contact, `Generated ${nowText()}`].filter(Boolean).join('  |  '), W - 2 * M - 440), W - M, H - 26); g.textAlign = 'left';
    // Fit onto one A4 page when it is not too long; otherwise keep one long A4-width image.
    let out = c;
    if (H > A4H && A4H / H >= 0.55) {
      const page = document.createElement('canvas'); page.width = W; page.height = A4H;
      const pg = page.getContext('2d'); pg.fillStyle = '#fff'; pg.fillRect(0, 0, W, A4H);
      const k = A4H / H; const w = W * k;
      pg.imageSmoothingQuality = 'high';
      pg.drawImage(c, (W - w) / 2, 0, w, A4H);
      out = page;
    } else if (H < A4H) {
      const page = document.createElement('canvas'); page.width = W; page.height = A4H;
      const pg = page.getContext('2d'); pg.fillStyle = '#fff'; pg.fillRect(0, 0, W, A4H);
      pg.drawImage(c, 0, 0, W, H - 64, 0, 0, W, H - 64);
      pg.drawImage(c, 0, H - 64, W, 64, 0, A4H - 64, W, 64);
      out = page;
    }
    const fname = `${report.filename}.jpg`;
    const b64 = out.toDataURL('image/jpeg', 0.93).split(',')[1];
    save(fname, 'image/jpeg', b64, b64ToBlob(b64, 'image/jpeg'));
    return fname;
  }

  root.EXPORT = { pdf, xlsx, jpeg, opdSlip, pdfText };
})(window);
