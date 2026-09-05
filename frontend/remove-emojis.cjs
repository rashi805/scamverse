const fs = require('fs');
const path = require('path');

// 1. Dashboard
let dashPath = './src/pages/Dashboard.jsx';
let dash = fs.readFileSync(dashPath, 'utf8');
if (!dash.includes('CheckCircle2')) {
  dash = dash.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport { CheckCircle2, XCircle } from 'lucide-react';");
  dash = dash.replace("✓{s.correctDecisions} / ✗{s.incorrectDecisions}", "<CheckCircle2 size={14} className=\"inline mr-1 text-success\"/>{s.correctDecisions} / <XCircle size={14} className=\"inline ml-2 mr-1 text-danger\"/>{s.incorrectDecisions}");
  fs.writeFileSync(dashPath, dash);
}

// 2. WalletChecker
let wcPath = './src/pages/WalletChecker.jsx';
let wc = fs.readFileSync(wcPath, 'utf8');
if (!wc.includes('AlertTriangle')) {
  wc = wc.replace("import PageHeader from '../components/PageHeader.jsx';", "import PageHeader from '../components/PageHeader.jsx';\nimport { AlertTriangle } from 'lucide-react';");
  wc = wc.replace("⚠️ HIGH RISK — matches found", "<span className=\"flex items-center gap-2\"><AlertTriangle size={24} /> HIGH RISK — matches found</span>");
  fs.writeFileSync(wcPath, wc);
}

// 3. ThreatRegistry
let trPath = './src/pages/ThreatRegistry.jsx';
let tr = fs.readFileSync(trPath, 'utf8');
if (!tr.includes('AlertTriangle')) {
  tr = tr.replace("import PageHeader from '../components/PageHeader.jsx';", "import PageHeader from '../components/PageHeader.jsx';\nimport { AlertTriangle } from 'lucide-react';");
  tr = tr.replace("⚠️ Found {checkResult.matches.length} matching record(s)", "<span className=\"flex items-center gap-2 text-warning\"><AlertTriangle size={18} /> Found {checkResult.matches.length} matching record(s)</span>");
  fs.writeFileSync(trPath, tr);
}

// 4. Simulator
let simPath = './src/pages/Simulator.jsx';
let sim = fs.readFileSync(simPath, 'utf8');
if (!sim.includes('MessageSquare')) {
  sim = sim.replace("import { useTranslation } from '../i18n/index.jsx';", "import { useTranslation } from '../i18n/index.jsx';\nimport { MessageSquare, Smartphone, Mail, Phone, Globe, TabletSmartphone, User, Megaphone, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';");
  sim = sim.replace(
    "const channelIcon = { sms: '💬', whatsapp: '📱', email: '✉️', call: '📞', website: '🌐', app: '📲', in_person: '🧍', social_media: '📣' };", 
    "const channelIcon = { sms: <MessageSquare size={16} className=\"inline mr-1\" />, whatsapp: <Smartphone size={16} className=\"inline mr-1\" />, email: <Mail size={16} className=\"inline mr-1\" />, call: <Phone size={16} className=\"inline mr-1\" />, website: <Globe size={16} className=\"inline mr-1\" />, app: <TabletSmartphone size={16} className=\"inline mr-1\" />, in_person: <User size={16} className=\"inline mr-1\" />, social_media: <Megaphone size={16} className=\"inline mr-1\" /> };"
  );
  sim = sim.replace(
    "<p className=\"font-semibold mb-1\">{result.isCorrect ? t('sim_safe') : t('sim_risky')}</p>",
    "<p className=\"font-semibold mb-1 flex items-center gap-2\">{result.isCorrect ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} {result.isCorrect ? t('sim_safe') : t('sim_risky')}</p>"
  );
  fs.writeFileSync(simPath, sim);
}

// 5. Clean up i18n
function removeEmojis(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/✅ /g, '');
  content = content.replace(/❌ /g, '');
  content = content.replace(/⚠️ /g, '');
  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}
removeEmojis('./src/i18n/en.js');
removeEmojis('./src/i18n/hi.js');
removeEmojis('./src/i18n/mr.js');

console.log("Emojis removed and replaced with Lucide icons.");
