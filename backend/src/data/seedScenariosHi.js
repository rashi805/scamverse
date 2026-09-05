/**
 * Hindi Scenario Seed — 5 scenarios targeting common India-specific scams.
 * All narratives are simulation-only; no real scam functionality is created.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ScamScenario = require('../models/ScamScenario');

const scenariosHi = [
  {
    lang: 'hi',
    title: 'संदिग्ध OTP अनुरोध',
    category: 'banking',
    subType: 'otp_scam',
    difficulty: 'beginner',
    triggerTags: ['fear', 'urgency', 'authority'],
    description: 'एक कॉलर दावा करता है कि वह आपके बैंक की सुरक्षा टीम से है और खाता "सत्यापित" करने के लिए OTP मांगता है।',
    redFlagsSummary: [
      'बैंक कभी भी फोन कॉल पर OTP नहीं मांगते।',
      'घबराहट और जल्दबाजी से जल्द निर्णय लेने का दबाव डाला गया।',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'call',
        narrative: '"नमस्ते, मैं राहुल शर्मा, SBI बैंक की सुरक्षा टीम से बोल रहा हूँ। आपके खाते में संदिग्ध लेनदेन देखा गया है। कृपया अभी आपके मोबाइल पर आया OTP बताएं ताकि हम आपका खाता तुरंत सुरक्षित कर सकें।"',
        options: [
          {
            optionId: 'a',
            text: 'लेनदेन रोकने के लिए तुरंत OTP बताएं।',
            isSafe: false,
            isRisky: true,
            explanation: 'बैंक कभी भी फोन पर OTP नहीं मांगते। OTP बताने से कॉलर को आपके खाते से पैसे निकालने की शक्ति मिल जाती है।',
          },
          {
            optionId: 'b',
            text: 'फोन काटें और अपने कार्ड पर दिए या बैंक की आधिकारिक वेबसाइट पर मिले नंबर पर खुद कॉल करें।',
            isSafe: true,
            isRisky: false,
            explanation: 'सही निर्णय। आधिकारिक, स्वतंत्र रूप से प्राप्त नंबर से जाँच करना हमेशा सुरक्षित तरीका है।',
          },
          {
            optionId: 'c',
            text: 'कॉलर से अपनी पहचान साबित करने को कहें, फिर OTP दें।',
            isSafe: false,
            isRisky: true,
            explanation: 'ठग आसानी से फर्जी कर्मचारी ID या नाम का उपयोग कर सकते हैं। OTP किसी को भी नहीं देना चाहिए।',
          },
        ],
      },
    ],
  },
  {
    lang: 'hi',
    title: 'KYC समाप्ति की चेतावनी',
    category: 'banking',
    subType: 'kyc_scam',
    difficulty: 'beginner',
    triggerTags: ['fear', 'urgency'],
    description: 'WhatsApp पर एक संदेश आता है कि आपका KYC समाप्त हो रहा है और खाता बंद होने से बचाने के लिए एक लिंक पर क्लिक करना होगा।',
    redFlagsSummary: [
      'बैंक WhatsApp पर KYC लिंक नहीं भेजते।',
      'असली KYC अपडेट बैंक शाखा या आधिकारिक ऐप पर होता है।',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'whatsapp',
        narrative: 'WhatsApp: "⚠️ प्रिय ग्राहक, आपका HDFC बैंक KYC 24 घंटे में समाप्त हो रहा है। खाता बंद होने से बचाने के लिए अभी यहाँ क्लिक करें: http://hdfc-kyc-update.xyz/verify"',
        options: [
          {
            optionId: 'a',
            text: 'लिंक पर क्लिक करें और KYC अपडेट करें।',
            isSafe: false,
            isRisky: true,
            explanation: 'यह एक फिशिंग लिंक है। यहाँ दी गई जानकारी सीधे ठगों तक पहुँचती है।',
          },
          {
            optionId: 'b',
            text: 'संदेश को नजरअंदाज करें और बैंक की आधिकारिक ऐप या नजदीकी शाखा से KYC स्टेटस जाँचें।',
            isSafe: true,
            isRisky: false,
            explanation: 'सही। KYC अपडेट हमेशा बैंक की आधिकारिक ऐप, वेबसाइट या शाखा पर करें।',
          },
          {
            optionId: 'c',
            text: 'नंबर को WhatsApp पर "SBI/HDFC बैंक" लिखकर जाँचें, फिर क्लिक करें।',
            isSafe: false,
            isRisky: true,
            explanation: 'ठग बैंक के नाम से भेज सकते हैं। URL की जाँच करें — असली बैंक URL hdfc.com या sbi.co.in होगा।',
          },
        ],
      },
    ],
  },
  {
    lang: 'hi',
    title: 'नकली नौकरी का प्रस्ताव',
    category: 'job_loan',
    subType: 'fake_job_offer',
    difficulty: 'intermediate',
    triggerTags: ['greed', 'curiosity'],
    description: 'LinkedIn या SMS पर एक आकर्षक नौकरी का ऑफर आता है जिसमें "सिक्योरिटी डिपॉजिट" या "रजिस्ट्रेशन फी" मांगी जाती है।',
    redFlagsSummary: [
      'असली कंपनियाँ नौकरी के लिए कभी पैसे नहीं माँगतीं।',
      'ऑफर बहुत अच्छा लगे तो सावधान रहें।',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'social_media',
        narrative: 'LinkedIn पर संदेश: "बधाई! आपका प्रोफाइल देखकर हमारी टीम ने आपको ₹65,000/महीना WFH जॉब के लिए चुना है। शुरुआत के लिए ₹2,500 की सिक्योरिटी डिपॉजिट जमा करें और अपना किट प्राप्त करें। UPI: scam@paytm"',
        options: [
          {
            optionId: 'a',
            text: '₹2,500 जमा करें और किट का इंतज़ार करें।',
            isSafe: false,
            isRisky: true,
            explanation: 'यह एक ठगी है। पैसे भेजने के बाद संपर्क टूट जाएगा और कोई किट नहीं आएगा।',
          },
          {
            optionId: 'b',
            text: 'कंपनी का नाम Google पर खोजें और आधिकारिक HR से सीधे संपर्क करें।',
            isSafe: true,
            isRisky: false,
            explanation: 'सही। असली नौकरी के लिए कभी पैसे नहीं देने होते।',
          },
          {
            optionId: 'c',
            text: 'थोड़ा और जानकारी माँगें और फिर पैसे भेजें।',
            isSafe: false,
            isRisky: true,
            explanation: 'ठग और जानकारी देंगे लेकिन मूल तथ्य नहीं बदलेगा — नौकरी के लिए कभी पैसे नहीं देने चाहिए।',
          },
        ],
      },
    ],
  },
  {
    lang: 'hi',
    title: 'UPI Collect Request — "रिफंड" का जाल',
    category: 'digital_payment',
    subType: 'upi_request_scam',
    difficulty: 'beginner',
    triggerTags: ['greed', 'curiosity'],
    description: 'UPI ऐप पर एक "Collect Request" आता है जिसमें लिखा होता है कि ₹1 स्वीकार करने पर रिफंड मिलेगा।',
    redFlagsSummary: [
      'UPI Collect Request को "Accept" करने पर पैसे जाते हैं, आते नहीं।',
      'रिफंड के लिए कभी UPI PIN नहीं डालना होता।',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'app',
        narrative: 'PhonePe नोटिफिकेशन: "₹1 का Payment Request — \'Refund Team\' से। स्वीकार करें और अपना ₹5,000 रिफंड पाएं।"',
        options: [
          {
            optionId: 'a',
            text: 'Request Accept करें और UPI PIN डालें।',
            isSafe: false,
            isRisky: true,
            explanation: 'UPI PIN डालने पर आपके खाते से पैसे कटेंगे। यह "रिफंड" नहीं, एक ठगी है।',
          },
          {
            optionId: 'b',
            text: 'Request रद्द करें और असली कंपनी के आधिकारिक चैनल पर रिफंड स्टेटस जाँचें।',
            isSafe: true,
            isRisky: false,
            explanation: 'सही। UPI Collect Request को Accept करना = पैसे देना। रिफंड हमेशा सीधे आता है, PIN नहीं माँगा जाता।',
          },
        ],
      },
    ],
  },
  {
    lang: 'hi',
    title: 'लॉटरी जीत का संदेश',
    category: 'social_engineering',
    subType: 'lottery_scam',
    difficulty: 'beginner',
    triggerTags: ['greed', 'curiosity'],
    description: 'एक SMS या WhatsApp संदेश में बताया जाता है कि आपने लाखों रुपये की लॉटरी जीती है।',
    redFlagsSummary: [
      'जो लॉटरी आपने खेली ही नहीं, उसे जीत नहीं सकते।',
      'पुरस्कार पाने के लिए "टैक्स" या "प्रोसेसिंग फी" माँगना ठगी का पहला संकेत है।',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'sms',
        narrative: 'SMS: "बधाई! आपका नंबर KBC Lucky Draw में ₹25 लाख जीता है! पुरस्कार पाने के लिए पहले ₹5,000 GST डिपॉजिट करें। व्हाट्सएप: +91-9XXXXXXXXX"',
        options: [
          {
            optionId: 'a',
            text: 'दिए गए नंबर पर WhatsApp करें और प्रक्रिया समझें।',
            isSafe: false,
            isRisky: true,
            explanation: 'संपर्क करने पर वे और अधिक पैसे माँगते रहेंगे। यह एक क्लासिक एडवांस फी ठगी है।',
          },
          {
            optionId: 'b',
            text: 'संदेश को नजरअंदाज करें और डिलीट कर दें।',
            isSafe: true,
            isRisky: false,
            explanation: 'सही। जो लॉटरी आपने खेली ही नहीं, उसे जीत नहीं सकते। असली पुरस्कार के लिए कभी पैसे नहीं देने होते।',
          },
          {
            optionId: 'c',
            text: '₹5,000 GST जमा करें और पुरस्कार का इंतज़ार करें।',
            isSafe: false,
            isRisky: true,
            explanation: 'पैसे भेजने के बाद "और टैक्स" या "कस्टम फी" माँगी जाएगी और अंत में कुछ नहीं मिलेगा।',
          },
        ],
      },
    ],
  },
];

async function seed() {
  await connectDB();
  // Remove existing Hindi scenarios to avoid duplicates
  await ScamScenario.deleteMany({ lang: 'hi' });
  await ScamScenario.insertMany(scenariosHi);
  console.log(`[SEED] Inserted ${scenariosHi.length} Hindi (hi) scenarios.`);
  mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
