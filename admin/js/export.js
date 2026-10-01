/*
 * PDF (A4) and Excel export for every screen and report.
 * A report is { title, subtitle, filename, kpis: [[label, value]], sections: [{ title, head, rows, foot, right: [colIdx] }] }.
 * PDFs use jsPDF + AutoTable, Excel files use SheetJS; both are bundled in vendor/ so export works offline.
 */
(function (root) {
  const LOGO = 'data:image/jpeg;base64,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';
  const LOGO_IMG = typeof Image !== 'undefined' ? Object.assign(new Image(), { src: LOGO }) : null;
  const NAVY = [31, 42, 43];
  const BRAND = [1, 91, 83];
  const INK = [27, 36, 37];
  const MUTED = [90, 104, 102];
  const ZEBRA = [242, 247, 246];

  // The built-in PDF fonts have no ₹ or some symbols; replace them with plain equivalents.
  const pdfText = (v) => String(v == null ? '' : v).replace(/₹/g, 'Rs ').replace(/[−–—]/g, '-').replace(/[✓✔]/g, 'Yes')
    .replace(/…/g, '...').replace(/[^\x00-\xFF]/g, '');

  function save(filename, mime, base64, blob) {
    if (root.AndroidBridge && root.AndroidBridge.saveBase64) { root.AndroidBridge.saveBase64(filename, mime, base64); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
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

    const header = () => {
      doc.setFillColor(...NAVY); doc.rect(0, 0, W, 24, 'F');
      doc.setFillColor(...BRAND); doc.rect(0, 24, W, 1.2, 'F');
      doc.setFillColor(255, 255, 255); doc.roundedRect(M, 4.5, 46, 15.5, 2, 2, 'F');
      try { doc.addImage(LOGO, 'JPEG', M + 1.5, 5.4, 43, 14.7); } catch (_) { /* logo optional */ }
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
      doc.text(pdfText(report.title), W - M, 12, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      doc.text(pdfText(clinic || 'The Prime Fit'), W - M, 18, { align: 'right' });
    };
    const footer = (n, total) => {
      doc.setDrawColor(219, 228, 238); doc.line(M, H - 11, W - M, H - 11);
      doc.setFontSize(7.5); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal');
      doc.text(pdfText(`${clinic || 'The Prime Fit'} · Generated ${when}`), M, H - 6.5);
      doc.text(`Page ${n} of ${total}`, W - M, H - 6.5, { align: 'right' });
    };

    header();
    let y = 32;
    doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    if (report.subtitle) { doc.text(pdfText(report.subtitle), M, y); y += 6; }

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
      if (y > H - 40) { doc.addPage(); header(); y = 32; }
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
        margin: { left: M, right: M, top: 30, bottom: 16 },
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
    let need = 190 + (report.subtitle ? 40 : 0) + (kpis.length ? Math.ceil(kpis.length / per) * 112 + 20 : 0) + 110;
    layouts.forEach((l) => { need += 70 + rowH * (l.rows.length + 1 + (l.s.foot ? 1 : 0)) + 34; });
    const H = Math.min(MAX_H, Math.ceil(need));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    function roundRect(x, yy, w, h, r) { g.beginPath(); g.moveTo(x + r, yy); g.arcTo(x + w, yy, x + w, yy + h, r); g.arcTo(x + w, yy + h, x, yy + h, r); g.arcTo(x, yy + h, x, yy, r); g.arcTo(x, yy, x + w, yy, r); g.closePath(); }
    const fit = (text, max) => { let t = String(text == null ? '' : text); while (t.length > 1 && g.measureText(t).width > max) t = t.slice(0, -2) + '…'; return t; };
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = rgb(NAVY); g.fillRect(0, 0, W, 134);
    g.fillStyle = rgb(BRAND); g.fillRect(0, 134, W, 6);
    g.fillStyle = '#fff'; roundRect(M, 24, 256, 88, 12); g.fill();
    try { if (LOGO_IMG && LOGO_IMG.complete) g.drawImage(LOGO_IMG, M + 10, 28, 236, 80); } catch (_) { /* logo optional */ }
    g.textAlign = 'right'; g.fillStyle = '#fff';
    g.font = `bold 46px ${FONT}`; g.fillText(report.title, W - M, 74);
    g.font = `24px ${FONT}`; g.fillText(clinic || 'The Prime Fit', W - M, 110);
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
    const limit = H - 110;
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
    const fy = Math.min(H - 40, y + 50);
    g.fillStyle = 'rgb(217,228,226)'; g.fillRect(M, fy - 34, W - 2 * M, 2);
    g.fillStyle = rgb(MUTED); g.font = `19px ${FONT}`;
    g.fillText(`${clinic || 'The Prime Fit'} · Generated ${when}`, M, fy);
    if (cut) { g.textAlign = 'right'; g.fillStyle = '#cc3b2f'; g.fillText('More rows in the PDF / Excel export', W - M, fy); g.textAlign = 'left'; }
    // Crop the unused space at the bottom.
    const outH = Math.min(H, fy + 30);
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

  root.EXPORT = { pdf, xlsx, jpeg, pdfText };
})(window);
