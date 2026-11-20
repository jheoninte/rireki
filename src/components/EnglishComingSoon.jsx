import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
export default function EnglishComingSoon() {
  return <main className="market-coming-soon"><span><FileText size={27} /></span><p className="overline">ENGLISH RESUME</p><h1>A dedicated English resume builder<br />is on the way.</h1><p>We are preparing a format focused on professional experience, skills and measurable achievements.<br />For now, you can use the Japanese or Korean builder.</p><div><a className="btn btn-primary" href="/ko/">한국어 이력서<ArrowRight size={16} /></a><a className="btn btn-secondary" href="/">日本語の履歴書<ArrowRight size={16} /></a></div></main>;
}
