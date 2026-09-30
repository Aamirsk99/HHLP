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
      doc.text(pdfText(clinic || 'Hindivine Healthcare'), W - M, 18, { align: 'right' });
    };
    const footer = (n, total) => {
      doc.setDrawColor(219, 228, 238); doc.line(M, H - 11, W - M, H - 11);
      doc.setFontSize(7.5); doc.setTextColor(...MUTED); doc.setFont('helvetica', 'normal');
      doc.text(pdfText(`${clinic || 'Hindivine Healthcare'} · Generated ${when}`), M, H - 6.5);
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
        doc.setFillColor(...BRAND); doc.rect(x, by + 2, 0.9, 10.5, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); doc.setTextColor(...MUTED);
        doc.text(pdfText(label).toUpperCase(), x + 3.5, by + 5.2, { maxWidth: bw - 5 });
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...INK);
        doc.text(pdfText(value), x + 3.5, by + 11.5, { maxWidth: bw - 5 });
      });
      y += Math.ceil(kpis.length / per) * 17 + 3;
    }

    report.sections.forEach((s) => {
      if (y > H - 60) { doc.addPage(); header(); y = 32; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY);
      doc.text(pdfText(s.title), M, y + 4);
      if (s.note) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MUTED); doc.text(pdfText(s.note), W - M, y + 4, { align: 'right' }); }
      const right = {};
      (s.right || []).forEach((i) => { right[i] = { halign: 'right' }; });
      doc.autoTable({
        startY: y + 6.5,
        head: [s.head.map(pdfText)],
        body: s.rows.length ? s.rows.map((r) => r.map(pdfText)) : [[{ content: 'No records for this selection', colSpan: s.head.length, styles: { halign: 'center', textColor: MUTED } }]],
        foot: s.foot ? [s.foot.map(pdfText)] : undefined,
        theme: 'grid',
        showHead: 'everyPage',
        showFoot: 'lastPage',
        rowPageBreak: 'avoid',
        margin: { left: M, right: M, top: 30, bottom: 16 },
        styles: { font: 'helvetica', fontSize: s.head.length > 9 ? 7 : 8.2, cellPadding: 1.8, lineColor: [219, 228, 238], lineWidth: 0.2, textColor: INK, overflow: 'linebreak' },
        headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', halign: 'left' },
        footStyles: { fillColor: [226, 236, 246], textColor: INK, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: ZEBRA },
        columnStyles: right,
        didParseCell: (d) => {
          if ((d.section === 'head' || d.section === 'foot') && right[d.column.index]) d.cell.styles.halign = 'right';
          if (d.section === 'body' && /ORDER REQUIRED/.test(String(d.cell.raw))) { d.cell.styles.textColor = [204, 59, 47]; d.cell.styles.fontStyle = 'bold'; }
        },
        didDrawPage: () => { header(); },
      });
      y = doc.lastAutoTable.finalY + 9;
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
   * A4 image (JPEG, 1240 × 1754 px ≈ 150 dpi) drawn on a canvas in the same layout as the PDF.
   * Long reports continue on extra images (…-page-2.jpg).
   */
  function jpeg(report, clinic) {
    const W = 1240; const H = 1754; const M = 60;
    const rgb = (a) => `rgb(${a.join(',')})`;
    const pages = [];
    let c; let g; let y;
    const logo = LOGO_IMG;
    const start = () => {
      c = document.createElement('canvas'); c.width = W; c.height = H; g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      g.fillStyle = rgb(NAVY); g.fillRect(0, 0, W, 130);
      g.fillStyle = rgb(BRAND); g.fillRect(0, 130, W, 6);
      g.fillStyle = '#fff'; roundRect(M, 22, 250, 86, 12); g.fill();
      try { g.drawImage(logo, M + 8, 26, 234, 80); } catch (_) { /* logo optional */ }
      g.textAlign = 'right'; g.fillStyle = '#fff';
      g.font = 'bold 44px Helvetica, Arial, sans-serif'; g.fillText(report.title, W - M, 72);
      g.font = '24px Helvetica, Arial, sans-serif'; g.fillText(clinic || 'Hindivine Healthcare', W - M, 108);
      g.textAlign = 'left';
      y = 180;
      pages.push(c);
    };
    function roundRect(x, yy, w, h, r) { g.beginPath(); g.moveTo(x + r, yy); g.arcTo(x + w, yy, x + w, yy + h, r); g.arcTo(x + w, yy + h, x, yy + h, r); g.arcTo(x, yy + h, x, yy, r); g.arcTo(x, yy, x + w, yy, r); g.closePath(); }
    const fit = (text, max) => { let t = String(text == null ? '' : text); while (t.length > 1 && g.measureText(t).width > max) t = t.slice(0, -2) + '…'; return t; };
    const ensure = (need) => { if (y + need > H - 90) start(); };
    start();
    if (report.subtitle) { g.font = 'bold 28px Helvetica, Arial, sans-serif'; g.fillStyle = rgb(INK); g.fillText(report.subtitle, M, y); y += 34; }
    const kpis = report.kpis || [];
    if (kpis.length) {
      const per = 4; const gap = 16; const bw = (W - 2 * M - gap * (per - 1)) / per;
      kpis.forEach(([label, value], i) => {
        const col = i % per; const row = Math.floor(i / per);
        const x = M + col * (bw + gap); const by = y + row * 110;
        g.fillStyle = rgb(ZEBRA); roundRect(x, by, bw, 92, 12); g.fill();
        g.fillStyle = (report.alertKpis || []).includes(i) ? '#cc3b2f' : rgb(BRAND); g.fillRect(x, by + 12, 6, 68);
        g.fillStyle = rgb(MUTED); g.font = '19px Helvetica, Arial, sans-serif'; g.fillText(fit(String(label).toUpperCase(), bw - 30), x + 22, by + 34);
        g.fillStyle = rgb(INK); g.font = 'bold 34px Helvetica, Arial, sans-serif'; g.fillText(fit(value, bw - 30), x + 22, by + 76);
      });
      y += Math.ceil(kpis.length / per) * 110 + 16;
    }
    report.sections.forEach((s) => {
      const cols = s.head.length;
      const rows = s.rows.length ? s.rows : [['No records']];
      g.font = '22px Helvetica, Arial, sans-serif';
      const widths = s.head.map((h, i) => Math.max(g.measureText(String(h)).width, ...rows.map((r) => g.measureText(String(r[i] == null ? '' : r[i])).width)) + 28);
      const total = widths.reduce((a, b) => a + b, 0);
      const scale = (W - 2 * M) / total;
      const cw = widths.map((w) => w * scale);
      ensure(140);
      g.fillStyle = rgb(NAVY); g.font = 'bold 30px Helvetica, Arial, sans-serif'; g.fillText(s.title, M, y + 26); y += 46;
      const rowH = 44;
      const drawRow = (cells, style) => {
        ensure(rowH);
        let x = M;
        g.fillStyle = style === 'head' ? rgb(NAVY) : style === 'foot' ? 'rgb(226,236,246)' : style === 'alt' ? rgb(ZEBRA) : '#fff';
        g.fillRect(M, y, W - 2 * M, rowH);
        g.strokeStyle = 'rgb(219,228,238)'; g.lineWidth = 1; g.strokeRect(M, y, W - 2 * M, rowH);
        cells.forEach((v, i) => {
          if (i >= cols) return;
          const right = (s.right || []).includes(i);
          const hot = (style === 'body' || style === 'alt') && /ORDER REQUIRED/.test(String(v));
          g.fillStyle = style === 'head' ? '#fff' : hot ? '#cc3b2f' : rgb(INK);
          g.font = `${style === 'head' || style === 'foot' || hot ? 'bold ' : ''}21px Helvetica, Arial, sans-serif`;
          const t = fit(v, cw[i] - 20);
          g.textAlign = right ? 'right' : 'left';
          g.fillText(t, right ? x + cw[i] - 12 : x + 12, y + 29);
          g.textAlign = 'left';
          x += cw[i];
        });
        y += rowH;
      };
      drawRow(s.head, 'head');
      rows.forEach((r, i) => drawRow(r, i % 2 ? 'alt' : 'body'));
      if (s.foot) drawRow(s.foot, 'foot');
      y += 30;
    });
    const when = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    pages.forEach((pg, i) => {
      const gg = pg.getContext('2d');
      gg.fillStyle = 'rgb(219,228,238)'; gg.fillRect(M, H - 70, W - 2 * M, 2);
      gg.fillStyle = rgb(MUTED); gg.font = '19px Helvetica, Arial, sans-serif';
      gg.fillText(`${clinic || 'Hindivine Healthcare'} · Generated ${when}`, M, H - 38);
      gg.textAlign = 'right'; gg.fillText(`Page ${i + 1} of ${pages.length}`, W - M, H - 38); gg.textAlign = 'left';
    });
    const names = [];
    pages.forEach((pg, i) => {
      const name = `${report.filename}${pages.length > 1 ? `-page-${i + 1}` : ''}.jpg`;
      const url = pg.toDataURL('image/jpeg', 0.92);
      const b64 = url.split(',')[1];
      const bin = atob(b64); const bytes = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      save(name, 'image/jpeg', b64, new Blob([bytes], { type: 'image/jpeg' }));
      names.push(name);
    });
    return names.join(', ');
  }

  root.EXPORT = { pdf, xlsx, jpeg, pdfText };
})(window);
