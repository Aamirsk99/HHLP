// How-to-use tutorial for Hindivine Diet: one chapter per feature.
// Each shot = app actions (Playwright) + a highlight + one Hindi voice-over line.
// `hl` is a CSS selector to ring on the phone screen (null = no ring).
// `view: 'pdf1'|'pdf2'` shows a page of the A4 PDF instead of the phone screen.
// Toast messages are hidden before each screenshot unless `keepToast` is set.

const center = (p, sel) => p.evaluate((s) => { const el = document.querySelector(s); if (el) el.scrollIntoView({ block: 'center' }); }, sel);
const top = (p, sel) => p.evaluate((s) => { const el = document.querySelector(s); if (el) { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); } }, sel);
const go = async (p, name) => { await p.evaluate((n) => { location.hash = n; }, name); await p.waitForTimeout(350); };
const tap = async (p, sel) => { await p.click(sel); await p.waitForTimeout(350); };

module.exports = [
  {
    id: 'intro', title: 'परिचय', en: 'Introduction',
    shots: [{
      act: (p) => go(p, 'home'), hl: null,
      say: 'नमस्ते! हिन्दिवाइन डाइट ऐप में आपका स्वागत है। इस ऐप से आप किसी भी मरीज़ के लिए एक से सात दिन का डाइट चार्ट बना सकते हैं, हर डिश की रेसिपी देख सकते हैं, और ए-फ़ोर पीडीएफ़ प्रिंट कर सकते हैं। आइए, ऐप के सभी फ़ीचर एक-एक करके सीखते हैं।',
    }],
  },
  {
    id: 'dashboard', title: 'डैशबोर्ड', en: 'Dashboard',
    shots: [
      { act: (p) => go(p, 'home'), hl: '#kpis', say: 'ऐप खोलते ही डैशबोर्ड दिखता है। सबसे ऊपर कुल मरीज़, सेव किए गए चार्ट, रेसिपी और फ़ूड की गिनती दिखती है।' },
      { act: (p) => center(p, '#quick-grid'), hl: '#quick-grid', say: 'क्विक एक्शन में नया चार्ट, अगले हफ़्ते का चार्ट, पीडीएफ़ अपलोड, मरीज़, सेव चार्ट, रेसिपी, फ़ूड लाइब्रेरी और सेटिंग्स के बटन हैं।' },
      { act: (p) => top(p, '#recent-charts'), hl: '#recent-charts', say: 'नीचे हाल ही में बनाए गए चार्ट दिखते हैं। किसी भी चार्ट को एक टैप में खोल सकते हैं, या सीधे अगले हफ़्ते का चार्ट बना सकते हैं।' },
    ],
  },
  {
    id: 'menu', title: 'मेनू और टैब बार', en: 'Menu & tab bar',
    shots: [
      { act: async (p) => { await go(p, 'home'); await tap(p, '#menu'); }, hl: '#drawer-nav', say: 'ऊपर बाईं ओर मेनू बटन दबाने पर साइड मेनू खुलता है। यहाँ से ऐप की हर स्क्रीन पर जा सकते हैं।' },
      { act: async (p) => { await p.mouse.click(390, 400); await p.waitForTimeout(350); }, hl: '#tab-bar', say: 'स्क्रीन के नीचे टैब बार है: होम, मरीज़, नया चार्ट, चार्ट्स और रेसिपी। बीच वाला प्लस बटन नया डाइट चार्ट बनाता है।' },
    ],
  },
  {
    id: 'step1', title: 'स्टेप 1: मरीज़ की जानकारी', en: 'Step 1 · Patient details',
    shots: [
      { act: async (p) => { await go(p, 'home'); await tap(p, '.hero-cta'); }, hl: '#progress', say: 'नया डाइट चार्ट बनाने के लिए "न्यू डाइट चार्ट" बटन दबाइए। चार्ट पाँच आसान स्टेप में बनता है। ऊपर की पट्टी बताती है कि आप किस स्टेप पर हैं।' },
      {
        act: async (p) => {
          await p.fill('[name=name]', 'Sunita Sharma');
          await p.fill('[name=patientId]', 'HD-1024');
          await p.fill('[name=phone]', '98765 43210');
          await center(p, '[name=name]');
        },
        hl: '[name=name]', say: 'पहले स्टेप में मरीज़ का नाम, पेशेंट आईडी और मोबाइल नंबर लिखिए। अगर मरीज़ पहले से सेव है, तो ऊपर "सेव्ड पेशेंट" से चुन लीजिए, उनकी जानकारी अपने आप भर जाएगी।',
      },
      {
        act: async (p) => {
          await p.fill('[name=age]', '42');
          await p.fill('[name=heightCm]', '158');
          await p.fill('[name=weightKg]', '72');
          await p.fill('[name=notes]', 'HbA1c 7.2, on metformin');
          await center(p, '#bmi-live');
        },
        hl: '#bmi-live', say: 'उम्र, लिंग, ऊँचाई और वज़न डालते ही बीएमआई अपने आप दिखता है। ये सब वैकल्पिक हैं, खाली छोड़ने पर स्टैंडर्ड टारगेट लिए जाते हैं। फिर "नेक्स्ट" दबाइए।',
      },
    ],
  },
  {
    id: 'step2', title: 'स्टेप 2: डाइट प्लान और टारगेट', en: 'Step 2 · Diet plan & targets',
    shots: [
      { act: async (p) => { await tap(p, '#step-next'); }, hl: '.seg[data-name=chartType]', say: 'दूसरे स्टेप में चार्ट का प्रकार चुनिए: रेगुलर डाइट या ट्रैवल डाइट। ट्रैवल डाइट में ट्रेन, फ़्लाइट, रोड या होटल का विकल्प मिलता है।' },
      { act: async (p) => { await p.selectOption('#plan', 'diabetic'); await p.waitForTimeout(200); }, hl: '#plan', say: 'फिर डाइट का प्रकार चुनिए, जैसे वज़न घटाना, वज़न बढ़ाना, बैलेंस्ड, हाई प्रोटीन, डायबिटीज़, पीसीओएस, थायरॉइड, बीपी, हार्ट, किडनी, प्रेग्नेंसी या स्तनपान। साथ में वज़न का लक्ष्य और एक्टिविटी चुनें।' },
      {
        act: async (p) => {
          await p.click('#kcal-chips .chip[data-value="1400"]');
          await p.click('#protein-chips .chip[data-value="60"]');
          await center(p, '#protein-chips');
        },
        hl: '#kcal-chips', say: 'कैलोरी, प्रोटीन और पानी का रोज़ का टारगेट चिप दबाकर चुनिए, या अपनी संख्या लिखिए। "ऑटो" रखने पर ऐप मरीज़ के हिसाब से खुद टारगेट तय करता है।',
      },
      {
        act: async (p) => { await p.click('#condition-chips .chip[data-value="hypertension"]'); await center(p, '#condition-chips'); },
        hl: '#condition-chips', say: 'अगर मरीज़ को कोई और बीमारी है, जैसे हाई बीपी या कोलेस्ट्रॉल, तो उसे भी चुनें। चार्ट में उस बीमारी में मना की गई चीज़ें कभी नहीं आएँगी।',
      },
    ],
  },
  {
    id: 'step3', title: 'स्टेप 3: खाने की पसंद', en: 'Step 3 · Food preferences',
    shots: [
      { act: async (p) => { await tap(p, '#step-next'); }, hl: '#diet-seg', say: 'तीसरे स्टेप में खाने का प्रकार चुनें: शाकाहारी, जैन, अंडा, नॉन-वेज या वीगन।' },
      {
        act: async (p) => { await p.click('#region-chips .chip[data-value="N"]'); await center(p, '#mix-chips'); },
        hl: '#mix-chips', say: 'डाइट कॉम्बिनेशन से वेज के साथ अंडा, चिकन या मछली जैसा मेल चुन सकते हैं। क्यूज़ीन में नॉर्थ इंडियन, साउथ इंडियन, गुजराती जैसे क्षेत्र चुनें।',
      },
      {
        act: async (p) => {
          for (const f of ['poha', 'paneer', 'idli']) { await p.fill('[data-tags=likes] input', f); await p.press('[data-tags=likes] input', 'Enter'); }
          for (const f of ['karela', 'brinjal']) { await p.fill('[data-tags=dislikes] input', f); await p.press('[data-tags=dislikes] input', 'Enter'); }
          await p.evaluate(() => document.activeElement.blur());
          await center(p, '[data-tags=likes]');
        },
        hl: '[data-tags=likes]', say: 'मरीज़ को जो खाना पसंद है, और जिन चीज़ों से परहेज़ है, उनके नाम टाइप करके एंटर दबाइए। पसंद का खाना चार्ट में ज़्यादा आएगा, और परहेज़ वाला बिल्कुल नहीं।',
      },
      {
        act: async (p) => { await p.click('#exclude-chips .chip[data-value="fried"]'); await center(p, '#exclude-chips'); },
        hl: '#exclude-chips', say: 'क्विक एक्सक्लूज़न और एलर्जी भी एक टैप में चुनें, जैसे तला हुआ खाना, चीनी या मूँगफली।',
      },
    ],
  },
  {
    id: 'step4', title: 'स्टेप 4: दिन और भाषा', en: 'Step 4 · Days & language',
    shots: [
      { act: async (p) => { await tap(p, '#step-next'); }, hl: '#days-chips', say: 'चौथे स्टेप में चुनें कि चार्ट कितने दिन का हो, एक दिन से सात दिन तक।' },
      { act: async (p) => { await p.selectOption('#chart-lang', 'hi'); await p.selectOption('#chart-lang2', 'en'); await p.waitForTimeout(200); }, hl: '#chart-lang', say: 'चार्ट की भाषा चुनें। दस भाषाएँ हैं: अंग्रेज़ी, हिन्दी, मराठी, गुजराती, बंगाली, पंजाबी, तमिल, तेलुगु, कन्नड़ और मलयालम। चाहें तो दूसरी भाषा भी जोड़ सकते हैं।' },
      { act: async (p) => { await center(p, '#times'); }, hl: '#times', say: 'चार्ट किस दिन से शुरू हो, दिन में कितने मील हों, और हर मील का समय भी यहीं सेट करें।' },
    ],
  },
  {
    id: 'step5', title: 'स्टेप 5: डाइटीशियन और चार्ट बनाइए', en: 'Step 5 · Dietitian & create',
    shots: [
      {
        act: async (p) => {
          await tap(p, '#step-next');
          await p.fill('[name=dietitian]', 'Ms. Priya Verma');
          await p.fill('[name=qualification]', 'M.Sc. Nutrition');
          await p.evaluate(() => document.activeElement.blur());
        },
        hl: '[name=dietitian]', say: 'पाँचवें स्टेप में डाइटीशियन का नाम, योग्यता और संपर्क नंबर लिखें। यह जानकारी हर चार्ट पर छपती है।',
      },
      { act: (p) => center(p, '#review'), hl: '#generate', say: 'नीचे पूरी जानकारी का रिव्यू दिखता है। सब सही हो तो "जनरेट चार्ट" दबाइए। खुद से खाना चुनना हो, तो "बिल्ड मैनुअली" दबाइए।' },
    ],
  },
  {
    id: 'chart', title: 'डाइट चार्ट देखिए', en: 'Your diet chart',
    shots: [
      { act: async (p) => { await tap(p, '#generate'); await p.waitForTimeout(600); await p.selectOption('#chart-lang-quick', 'en'); await p.selectOption('#chart-lang2-quick', 'hi'); await p.waitForTimeout(300); await p.evaluate(() => window.scrollTo(0, 0)); }, hl: '.summary', say: 'बस! डाइट चार्ट तैयार है। ऊपर मरीज़ का नाम, डाइट का प्रकार, और रोज़ की कैलोरी और प्रोटीन दिखता है।' },
      { act: async (p) => { await center(p, '.tiles'); }, hl: '.tiles', say: 'साथ में बीएमआई, कार्ब्स और फ़ैट, रोज़ का पानी, और कितने मील कॉम्बिनेशन संभव हैं, यह भी दिखता है।' },
      { act: async (p) => { await p.click('.days [data-day="1"]'); await p.waitForTimeout(300); await top(p, '.days'); }, hl: '.days', say: 'दिन के टैब दबाकर हर दिन का खाना देखिए। हर मील में खाने का नाम, मात्रा, समय और कैलोरी लिखी होती है।' },
    ],
  },
  {
    id: 'edit', title: 'मील एडिट, स्वैप और लॉक', en: 'Edit, swap & lock meals',
    shots: [
      { act: async (p) => { await center(p, '.meal-card:nth-child(2) .acts'); }, hl: '.meal-card:nth-child(2) .acts', say: 'हर मील के नीचे तीन बटन हैं। पेंसिल से मील एडिट करें, घूमते तीर से दूसरा विकल्प लें, और ताले से मील लॉक करें, ताकि नया प्लान बनाने पर वह मील न बदले।' },
      { act: async (p) => { await p.click('.meal-card:nth-child(2) [data-swap]'); await p.waitForTimeout(300); await p.click('.meal-card:nth-child(2) [data-lock]'); await p.waitForTimeout(300); await center(p, '.meal-card:nth-child(2)'); }, hl: '.meal-card:nth-child(2)', say: 'स्वैप दबाते ही उतनी ही कैलोरी का नया खाना आ जाता है। लॉक करने पर मील पर ताला लग जाता है।' },
      { act: async (p) => { await p.click('.meal-card:nth-child(3) [data-edit]'); await p.waitForTimeout(400); }, hl: '#editor-items', say: 'एडिट दबाने पर यह स्क्रीन खुलती है। प्लस और माइनस से मात्रा बदलिए, या डिलीट से खाना हटाइए। ऊपर कुल कैलोरी और प्रोटीन तुरंत बदलते हैं।' },
      { act: async (p) => { await p.fill('#editor-q', 'paneer'); await p.waitForTimeout(400); await p.evaluate(() => { document.activeElement.blur(); document.querySelector('#editor-q').scrollIntoView({ block: 'start' }); }); }, hl: '#editor-results', say: 'सर्च बॉक्स में अंग्रेज़ी या हिन्दी में खाना खोजिए और प्लस दबाकर जोड़िए। चाहें तो अपनी खुद की डिश भी कैलोरी के साथ जोड़ सकते हैं।' },
      { act: async (p) => { await p.click('#editor-results [data-add]'); await p.waitForTimeout(200); await p.click('#apply-days .chip:nth-child(3)'); await p.evaluate(() => document.querySelector('#apply-days').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200); }, hl: '#apply-days', say: 'यही मील दूसरे दिनों में भी रखना हो, तो वे दिन चुनिए, फिर "सेव मील" दबाइए।' },
    ],
  },
  {
    id: 'recipe-in-chart', title: 'चार्ट से रेसिपी देखें', en: 'Recipe from the chart',
    shots: [
      { act: async (p) => { await tap(p, '#editor-save'); await p.waitForTimeout(300); await p.click('.meal-card:nth-child(3) [data-recipe]'); await p.waitForTimeout(400); }, hl: '#rd-body', say: 'चार्ट में किसी भी डिश के नाम पर टैप करें, उसकी रेसिपी खुल जाती है: ग्राम में सामग्री, बनाने का तरीका और पोषण की जानकारी।' },
      { act: async (p) => {}, hl: '#rd-foot', say: 'यहाँ से रेसिपी को ए-फ़ोर पर प्रिंट कर सकते हैं, या "ऐड टू चार्ट पीडीएफ़" दबाकर चार्ट की पीडीएफ़ में जोड़ सकते हैं।' },
    ],
  },
  {
    id: 'language', title: 'चार्ट की भाषा बदलें', en: 'Change chart language',
    shots: [
      { act: async (p) => { await p.click('#rd-foot [data-rd-toggle]'); await p.waitForTimeout(300); await p.selectOption('#chart-lang-quick', 'hi'); await p.waitForTimeout(400); await top(p, '.chart-controls'); }, hl: '.chart-controls', say: 'चार्ट के ऊपर से भाषा, दूसरी भाषा, शुरू होने का दिन और पानी तुरंत बदल सकते हैं। देखिए, हिन्दी चुनते ही पूरा चार्ट हिन्दी में आ गया।' },
    ],
  },
  {
    id: 'pdf', title: 'ए-फ़ोर पीडीएफ़ और प्रिंट', en: 'A4 PDF & print',
    shots: [
      { act: async (p) => {}, hl: '#chart-bar', say: 'नीचे की पट्टी में "पीडीएफ़ विद नेम" मरीज़ के नाम के साथ पीडीएफ़ बनाता है, और "पीडीएफ़ विदाउट नेम" बिना नाम के, सामान्य चार्ट के रूप में।' },
      { act: async (p) => {}, view: 'pdf1', hl: null, say: 'यह है ए-फ़ोर डाइट चार्ट। इसमें हिन्दिवाइन का लोगो, मरीज़ की जानकारी, टारगेट, हर दिन का खाना आइकन के साथ, और डाइटीशियन का नाम होता है।' },
      { act: async (p) => {}, view: 'pdf2', hl: null, say: 'छोटे चार्ट एक पेज में, और बड़े चार्ट दो पेज में आते हैं। जोड़ी गई रेसिपी अलग पेजों पर छपती हैं। पीडीएफ़ को सेव कीजिए, प्रिंट कीजिए, या व्हाट्सऐप पर मरीज़ को भेजिए।' },
    ],
  },
  {
    id: 'more', title: 'मोर मेनू', en: 'More options',
    shots: [
      { act: async (p) => { await tap(p, '#more'); }, hl: '#sheet-body', say: '"मोर" बटन में और विकल्प हैं: रेसिपी को पीडीएफ़ में जोड़ना, सिर्फ़ रेसिपी प्रिंट करना, एक्सेल के लिए सीएसवी एक्सपोर्ट, चार्ट की कॉपी सेव करना, और मरीज़ की हिस्ट्री।' },
      { act: async (p) => { await p.click('[data-sheet=recipes]'); await p.waitForTimeout(400); await p.click('.pick-list .pick:nth-child(2) input'); await p.click('.pick-list .pick:nth-child(4) input'); }, hl: '.pick-list', say: '"ऐड रेसिपीज़" में चार्ट की डिश पर टिक कीजिए और सेव दबाइए। ये रेसिपी चार्ट के बाद ए-फ़ोर पेजों पर छपेंगी।' },
    ],
  },
  {
    id: 'nextweek', title: 'अगले हफ़्ते का चार्ट', en: 'Next week\'s chart',
    shots: [
      { act: async (p) => { await p.click('[data-pick-save]'); await p.waitForTimeout(300); await p.evaluate(() => window.scrollTo(0, 0)); }, hl: '#next-week', say: 'फ़ॉलो-अप पर अगले हफ़्ते का चार्ट बनाना हो, तो बस "नेक्स्ट वीक" दबाइए।' },
      { act: async (p) => { await p.selectOption('#chart-lang-quick', 'en'); await p.waitForTimeout(200); await tap(p, '#next-week'); await p.waitForTimeout(500); }, keepToast: true, hl: '.summary', say: 'उसी मरीज़ और सेटिंग्स के साथ नया चार्ट बन जाता है, जिसमें लगभग सारा खाना बदल जाता है। ऊपर "वीक टू" लिखा दिखता है।' },
    ],
  },
  {
    id: 'patients', title: 'मरीज़ और हिस्ट्री', en: 'Patients & history',
    shots: [
      { act: async (p) => { await go(p, 'patients'); }, hl: '#pt-list', say: '"पेशेंट्स" स्क्रीन पर सभी मरीज़ दिखते हैं। चार्ट बनाते ही मरीज़ अपने आप सेव हो जाते हैं। ऊपर नाम, आईडी या मोबाइल से खोज सकते हैं।' },
      { act: async (p) => { await p.click('#pt-list [data-patient]'); await p.waitForTimeout(400); }, hl: '.fact-grid', say: 'मरीज़ पर टैप करें। उनकी उम्र, वज़न, बीएमआई और मोबाइल नंबर दिखता है। यहीं से नया चार्ट या अगले हफ़्ते का चार्ट बनाइए।' },
      { act: async (p) => { await top(p, '#pt-detail .list'); }, hl: '#pt-detail .list', say: 'नीचे वीक वन, वीक टू, ऐसी पूरी डाइट चार्ट हिस्ट्री है। कोई भी पुराना चार्ट खोलकर देख सकते हैं।' },
    ],
  },
  {
    id: 'charts', title: 'सेव किए गए चार्ट', en: 'Saved charts',
    shots: [
      { act: async (p) => { await go(p, 'charts'); }, hl: '#ch-list', say: '"सेव्ड चार्ट्स" में हर बना हुआ चार्ट अपने आप सेव रहता है। चार्ट खोलकर एडिट या दोबारा प्रिंट करें, "नेक्स्ट वीक" दबाएँ, या डस्टबिन से डिलीट करें।' },
    ],
  },
  {
    id: 'upload', title: 'पिछला पीडीएफ़ अपलोड', en: 'Upload previous PDF',
    shots: [
      { act: async (p) => { await go(p, 'upload'); }, hl: '.dropzone', say: 'मरीज़ के पास पिछले हफ़्ते का पीडीएफ़ हो, तो "अपलोड पीडीएफ़" खोलिए और फ़ाइल चुनिए।' },
      { act: async (p, ctx) => { await p.setInputFiles('#pdf-file', ctx.pdfPath); await p.waitForSelector('#upload-result .card:not(:has(.spinner))', { timeout: 20000 }); await p.waitForTimeout(300); await center(p, '#upload-result'); }, hl: '#upload-result', say: 'हिन्दिवाइन डाइट से बना पीडीएफ़ पूरी तरह पढ़ लिया जाता है: मरीज़, टारगेट और हर मील। फिर एक टैप में अगले हफ़्ते का चार्ट बनाइए। दूसरे पीडीएफ़ में से खाने के नाम पहचानकर, नए चार्ट में वे खाने बदल दिए जाते हैं।' },
    ],
  },
  {
    id: 'recipes', title: 'रेसिपी', en: 'Recipes',
    shots: [
      { act: async (p) => { await go(p, 'recipes'); await p.fill('#rc-search', 'paneer'); await p.waitForTimeout(400); await p.evaluate(() => document.activeElement.blur()); }, hl: '#rc-search', say: '"रेसिपी" स्क्रीन पर छह सौ इकहत्तर डिश की रेसिपी हैं। अंग्रेज़ी या हिन्दी में खोजिए, और कैटेगरी या खाने के प्रकार से फ़िल्टर कीजिए।' },
      { act: async (p) => { await p.click('#rc-list [data-open-recipe]'); await p.waitForTimeout(400); await tap(p, '#sv-inc'); await tap(p, '#sv-inc'); await center(p, '.serv'); }, hl: '.serv', say: 'रेसिपी खोलकर सर्विंग बदलिए, सामग्री की मात्रा अपने आप बदल जाती है। कैलोरी, प्रोटीन, कार्ब्स और फ़ैट सामग्री से कैलकुलेट होते हैं। "प्रिंट ए-फ़ोर" से रेसिपी प्रिंट करें।' },
    ],
  },
  {
    id: 'library', title: 'फ़ूड लाइब्रेरी', en: 'Food library',
    shots: [
      { act: async (p) => { await go(p, 'library'); await p.fill('#lib-search', 'dal'); await p.selectOption('#lib-sort', 'protein'); await p.waitForTimeout(400); await p.evaluate(() => document.activeElement.blur()); await top(p, '#lib-count'); }, hl: '#lib-list', say: '"फ़ूड लाइब्रेरी" में आठ सौ पैंसठ फ़ूड हैं, हिन्दी नाम के साथ। हर फ़ूड की मात्रा, कैलोरी, प्रोटीन, कार्ब्स और फ़ैट देखिए।' },
      { act: async (p) => { await p.evaluate(() => window.scrollTo(0, 0)); }, hl: '.library-head', say: 'कैटेगरी, क्यूज़ीन, खाने के प्रकार और कैलोरी से फ़िल्टर कीजिए, और कम कैलोरी या ज़्यादा प्रोटीन के हिसाब से सॉर्ट कीजिए।' },
    ],
  },
  {
    id: 'settings', title: 'सेटिंग्स और बैकअप', en: 'Settings & backup',
    shots: [
      { act: async (p) => { await go(p, 'settings'); }, hl: '#set-dietitian', say: '"सेटिंग्स" में डाइटीशियन की जानकारी एक बार सेव कर दीजिए, यह हर नए चार्ट पर अपने आप छपेगी।' },
      { act: async (p) => { await center(p, '#backup-export'); }, hl: '#backup-export', say: 'सारा डेटा आपके फ़ोन में ही रहता है। "एक्सपोर्ट बैकअप" से सभी मरीज़ों और चार्ट की फ़ाइल बनाइए, और नए फ़ोन में "इम्पोर्ट बैकअप" से वापस लाइए।' },
    ],
  },
  {
    id: 'outro', title: 'धन्यवाद', en: 'Thank you',
    shots: [{
      act: (p) => go(p, 'home'), hl: '.hero-cta',
      say: 'तो ये थे हिन्दिवाइन डाइट ऐप के सभी फ़ीचर। ऐप बिना इंटरनेट के भी चलता है। आज ही अपना पहला डाइट चार्ट बनाइए। धन्यवाद!',
    }],
  },
];
