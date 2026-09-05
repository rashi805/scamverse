import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/index.jsx';
import { Shield } from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center">
        <span className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
          ✨ Next-Gen Scam Protection
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-text">
          SCAM<span className="text-primary">VERSE</span> 360
        </h1>
        <p className="text-textMuted text-lg md:text-xl max-w-2xl mb-4 leading-relaxed">{t('landing_headline')}</p>
        <p className="text-textMuted text-base max-w-xl mb-10">{t('landing_sub')}</p>
        
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/signup" className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-primary/30 font-semibold px-8 py-3.5 rounded-full transition-all transform hover:-translate-y-1">
            {t('landing_cta')}
          </Link>
          <Link to="/login" className="bg-surfaceAlt text-text font-semibold border border-border px-8 py-3.5 rounded-full hover:border-primary transition-all">
            {t('landing_login')}
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl w-full">
          {[t('landing_cat_banking'), t('landing_cat_upi'), t('landing_cat_phishing'), t('landing_cat_web3')].map((c) => (
            <div key={c} className="bg-surface/80 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 border border-border flex flex-col items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Shield size={20} /></div>
              <p className="text-sm font-medium text-textMuted">{c}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
