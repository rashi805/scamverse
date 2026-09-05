const { analyzeUrl } = require('../utils/urlAnalyzer');
const { analyzeMessage } = require('../utils/messageAnalyzer');
const { detectGemini } = require('../services/aiDetector');

const DISCLAIMER = 'This result is a risk assessment, not a guarantee of safety.';

async function checkUrl(req, res, next) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ message: 'url is required' });
    }
    if (url.length > 2000) {
      return res.status(400).json({ message: 'URL too long' });
    }

    const aiResult = await detectGemini(url.trim(), 'URL');
    if (aiResult) {
      return res.json({ ...aiResult, disclaimer: DISCLAIMER });
    }

    const result = analyzeUrl(url.trim());
    res.json({ ...result, disclaimer: DISCLAIMER });
  } catch (err) {
    next(err);
  }
}

async function checkMessage(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'message is required' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ message: 'Message too long (max 5000 characters)' });
    }

    const aiResult = await detectGemini(message, 'Message');
    if (aiResult) {
      return res.json({ ...aiResult, disclaimer: DISCLAIMER });
    }

    const result = analyzeMessage(message);
    res.json({ ...result, disclaimer: DISCLAIMER });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkUrl, checkMessage };
