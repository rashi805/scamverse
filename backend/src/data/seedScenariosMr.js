/**
 * Marathi Scenario Seed — 5 scenarios targeting common India-specific scams.
 * All narratives are simulation-only; no real scam functionality is created.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ScamScenario = require('../models/ScamScenario');

const scenariosMr = [
  {
    lang: 'mr',
    title: 'संशयास्पद OTP विनंती',
    category: 'banking',
    subType: 'otp_scam',
    difficulty: 'beginner',
    triggerTags: ['fear', 'urgency', 'authority'],
    description: 'एक फोन कॉल येतो जो बँकेच्या सुरक्षा विभागाचा असल्याचे सांगतो आणि खाते "सत्यापित" करण्यासाठी OTP मागतो.',
    redFlagsSummary: [
      'बँका कधीही फोन कॉलवर OTP मागत नाहीत.',
      'घाई आणि भीती वापरून त्वरित निर्णय घेण्यास भाग पाडले जाते.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'call',
        narrative: '"नमस्कार, मी राज पाटील, SBI बँकेच्या सायबर सुरक्षा विभागातून बोलतोय. तुमच्या खात्यावर संशयास्पद व्यवहार झाला आहे. तुमच्या मोबाइलवर आलेला OTP सांगा म्हणजे आम्ही खाते लगेच सुरक्षित करतो."',
        options: [
          {
            optionId: 'a',
            text: 'व्यवहार थांबवण्यासाठी लगेच OTP सांगा.',
            isSafe: false,
            isRisky: true,
            explanation: 'बँका फोनवर OTP मागत नाहीत. OTP सांगितल्यास फसवणूकदाराला तुमच्या खात्यातून पैसे काढण्याची शक्ती मिळते.',
          },
          {
            optionId: 'b',
            text: 'फोन ठेवा आणि कार्डवरील किंवा बँकेच्या अधिकृत वेबसाइटवरील नंबरवर स्वतः फोन करा.',
            isSafe: true,
            isRisky: false,
            explanation: 'बरोबर. स्वतंत्रपणे मिळवलेल्या अधिकृत नंबरवर फोन करून तपासणे हा नेहमी सुरक्षित मार्ग आहे.',
          },
          {
            optionId: 'c',
            text: 'फोन करणाऱ्याला ओळख सिद्ध करण्यास सांगा, मग OTP द्या.',
            isSafe: false,
            isRisky: true,
            explanation: 'फसवणूकदार सहज बनावट कर्मचारी ID किंवा नाव वापरू शकतात. OTP कोणालाही देऊ नका.',
          },
        ],
      },
    ],
  },
  {
    lang: 'mr',
    title: 'बनावट KYC अद्यतन',
    category: 'banking',
    subType: 'kyc_scam',
    difficulty: 'beginner',
    triggerTags: ['fear', 'urgency'],
    description: 'WhatsApp वर एक संदेश येतो की KYC संपत आहे आणि खाते बंद होण्यापासून वाचवण्यासाठी लिंकवर क्लिक करावे लागेल.',
    redFlagsSummary: [
      'बँका WhatsApp वर KYC लिंक पाठवत नाहीत.',
      'खरे KYC अद्यतन बँकेच्या शाखेत किंवा अधिकृत अॅपवर होते.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'whatsapp',
        narrative: 'WhatsApp: "⚠️ प्रिय ग्राहक, तुमचे Axis Bank KYC २४ तासांत संपणार आहे. खाते बंद होण्यापासून वाचवण्यासाठी आत्ता क्लिक करा: http://axisbank-kyc-update.net/verify"',
        options: [
          {
            optionId: 'a',
            text: 'लिंकवर क्लिक करा आणि KYC अद्यतन करा.',
            isSafe: false,
            isRisky: true,
            explanation: 'हा एक फिशिंग लिंक आहे. दिलेली माहिती थेट फसवणूकदारांकडे जाते.',
          },
          {
            optionId: 'b',
            text: 'संदेश दुर्लक्षित करा आणि बँकेच्या अधिकृत अॅप किंवा जवळच्या शाखेत KYC स्थिती तपासा.',
            isSafe: true,
            isRisky: false,
            explanation: 'बरोबर. KYC अद्यतन नेहमी बँकेच्या अधिकृत अॅप, वेबसाइट किंवा शाखेत करा.',
          },
        ],
      },
    ],
  },
  {
    lang: 'mr',
    title: 'बनावट नोकरीची ऑफर',
    category: 'job_loan',
    subType: 'fake_job_offer',
    difficulty: 'intermediate',
    triggerTags: ['greed', 'curiosity'],
    description: 'LinkedIn किंवा SMS वर आकर्षक नोकरीची ऑफर येते ज्यात "सिक्युरिटी डिपॉझिट" किंवा "नोंदणी शुल्क" मागतात.',
    redFlagsSummary: [
      'खऱ्या कंपन्या नोकरीसाठी कधीही पैसे मागत नाहीत.',
      'ऑफर खूप चांगली वाटत असल्यास सावध राहा.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'social_media',
        narrative: 'LinkedIn संदेश: "अभिनंदन! तुमचे प्रोफाइल पाहून आम्ही तुम्हाला ₹60,000/महिना WFH नोकरीसाठी निवडले आहे. सुरुवातीसाठी ₹3,000 सिक्युरिटी डिपॉझिट भरा आणि किट मिळवा. UPI: fraud@gpay"',
        options: [
          {
            optionId: 'a',
            text: '₹3,000 भरा आणि किटची वाट पाहा.',
            isSafe: false,
            isRisky: true,
            explanation: 'ही फसवणूक आहे. पैसे पाठवल्यानंतर संपर्क तुटेल आणि किट येणार नाही.',
          },
          {
            optionId: 'b',
            text: 'कंपनीचे नाव Google वर शोधा आणि अधिकृत HR शी थेट संपर्क करा.',
            isSafe: true,
            isRisky: false,
            explanation: 'बरोबर. खऱ्या नोकरीसाठी कधीही पैसे द्यावे लागत नाहीत.',
          },
        ],
      },
    ],
  },
  {
    lang: 'mr',
    title: 'UPI Collect Request — "परतावा" सापळा',
    category: 'digital_payment',
    subType: 'upi_request_scam',
    difficulty: 'beginner',
    triggerTags: ['greed', 'curiosity'],
    description: 'UPI अॅपवर एक "Collect Request" येतो ज्यात सांगितले जाते की ₹1 स्वीकारल्यावर परतावा मिळेल.',
    redFlagsSummary: [
      'UPI Collect Request "Accept" केल्यावर पैसे जातात, येत नाहीत.',
      'परताव्यासाठी कधीही UPI PIN टाकण्याची गरज नसते.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'app',
        narrative: 'Google Pay सूचना: "₹1 चा Payment Request — \'Refund Desk\' कडून. स्वीकारा आणि तुमचा ₹8,000 परतावा मिळवा."',
        options: [
          {
            optionId: 'a',
            text: 'Request Accept करा आणि UPI PIN टाका.',
            isSafe: false,
            isRisky: true,
            explanation: 'UPI PIN टाकल्यावर तुमच्या खात्यातून पैसे जातील. हा परतावा नाही, फसवणूक आहे.',
          },
          {
            optionId: 'b',
            text: 'Request नाकारा आणि खऱ्या कंपनीच्या अधिकृत चॅनेलवर परतावा स्थिती तपासा.',
            isSafe: true,
            isRisky: false,
            explanation: 'बरोबर. UPI Collect Request Accept करणे = पैसे देणे. परतावा नेहमी थेट येतो, PIN मागितला जात नाही.',
          },
        ],
      },
    ],
  },
  {
    lang: 'mr',
    title: 'लॉटरी जिंकल्याचा संदेश',
    category: 'social_engineering',
    subType: 'lottery_scam',
    difficulty: 'beginner',
    triggerTags: ['greed', 'curiosity'],
    description: 'SMS किंवा WhatsApp वर संदेश येतो की तुम्ही लाखो रुपयांची लॉटरी जिंकली आहे.',
    redFlagsSummary: [
      'जी लॉटरी तुम्ही खेळलीच नाही, ती जिंकणे शक्य नाही.',
      'बक्षीस मिळवण्यासाठी "टॅक्स" किंवा "प्रक्रिया शुल्क" मागणे फसवणुकीचे पहिले लक्षण आहे.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'sms',
        narrative: 'SMS: "अभिनंदन! तुमचा नंबर KBC Lucky Draw मध्ये ₹20 लाख जिंकला आहे! बक्षीस मिळवण्यासाठी आधी ₹4,500 GST भरा. WhatsApp: +91-9XXXXXXXXX"',
        options: [
          {
            optionId: 'a',
            text: 'दिलेल्या नंबरवर WhatsApp करा आणि प्रक्रिया समजून घ्या.',
            isSafe: false,
            isRisky: true,
            explanation: 'संपर्क केल्यावर ते आणखी पैसे मागत राहतील. हा एक क्लासिक अग्रिम शुल्क घोटाळा आहे.',
          },
          {
            optionId: 'b',
            text: 'संदेश दुर्लक्षित करा आणि हटवा.',
            isSafe: true,
            isRisky: false,
            explanation: 'बरोबर. जी लॉटरी तुम्ही खेळलीच नाही, ती जिंकणे शक्य नाही. खऱ्या बक्षिसासाठी कधीही पैसे द्यावे लागत नाहीत.',
          },
          {
            optionId: 'c',
            text: '₹4,500 GST भरा आणि बक्षिसाची वाट पाहा.',
            isSafe: false,
            isRisky: true,
            explanation: 'पैसे पाठवल्यावर "आणखी कर" किंवा "सीमाशुल्क" मागितले जाईल आणि शेवटी काहीही मिळणार नाही.',
          },
        ],
      },
    ],
  },
];

async function seed() {
  await connectDB();
  await ScamScenario.deleteMany({ lang: 'mr' });
  await ScamScenario.insertMany(scenariosMr);
  console.log(`[SEED] Inserted ${scenariosMr.length} Marathi (mr) scenarios.`);
  mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
