import { useState } from 'react';
import { supabase } from './lib/supabase';
import { Calendar, Clock, MapPin, Sparkles, Check, X, CheckCircle2 } from 'lucide-react';

/* ─── INLINE STYLES ─────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

  html, body {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    user-select: auto !important;
    height: auto !important;
  }

  .cg-root {
    font-family: 'Outfit', sans-serif;
    background: #040706;
    color: #F3EFE9;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  .cg-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 100% 65% at 50% 0%, rgba(16,44,30,0.65) 0%, transparent 65%),
      radial-gradient(ellipse 55% 45% at 10% 85%, rgba(212,175,55,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 45% 40% at 90% 55%, rgba(16,44,30,0.25) 0%, transparent 50%),
      #040706;
    pointer-events: none;
  }

  .cg-gold-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: linear-gradient(90deg, transparent 0%, #C5A038 30%, #E5C158 50%, #C5A038 70%, transparent 100%);
  }

  .cg-wrap {
    position: relative; z-index: 1;
    max-width: 520px;
    margin: 0 auto;
    padding: 0 20px 80px;
  }

  /* Header */
  .cg-header {
    padding: 60px 0 36px;
    text-align: center;
    animation: cg-fadeDown 0.9s ease both;
  }

  .cg-brand-logo {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  }

  .cg-brand-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 500;
    letter-spacing: 5px;
    color: #E5C158;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.2;
    text-shadow: 0 2px 10px rgba(229,193,88,0.25);
  }

  .cg-brand-subtitle {
    font-size: 9px;
    letter-spacing: 4px;
    color: #8C9F95;
    text-transform: uppercase;
    margin-top: 5px;
    font-weight: 400;
  }

  /* Typography */
  .cg-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; font-weight: 500;
    letter-spacing: 3.5px; text-transform: uppercase;
    color: #E5C158; margin-bottom: 18px;
  }
  .cg-eyebrow::before, .cg-eyebrow::after {
    content: ''; display: inline-block;
    width: 24px; height: 1px;
    background: linear-gradient(to right, transparent, #C5A038);
  }
  .cg-eyebrow::after { background: linear-gradient(to left, transparent, #C5A038); }

  .cg-h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(40px, 9vw, 56px);
    font-weight: 300; line-height: 1.08;
    color: #F5F0E8; margin-bottom: 10px; letter-spacing: -0.5px;
  }
  .cg-h1 em { font-style: italic; color: #E5C158; }

  .cg-tagline {
    font-size: 14px; font-weight: 300;
    color: #8C9F95; letter-spacing: 0.4px;
    max-width: 380px; margin: 0 auto;
    line-height: 1.5;
  }

  /* Ornament */
  .cg-ornament {
    display: flex; align-items: center; gap: 12px; margin: 28px 0;
  }
  .cg-orn-line {
    flex: 1; height: 1px;
    background: linear-gradient(to right, transparent, rgba(197,160,56,0.3));
  }
  .cg-orn-line-r { background: linear-gradient(to left, transparent, rgba(197,160,56,0.3)); }
  .cg-orn-diamond {
    width: 6px; height: 6px;
    background: #C5A038; transform: rotate(45deg); flex-shrink: 0;
  }

  /* Cards */
  .cg-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(197,160,56,0.18);
    border-radius: 4px; overflow: hidden;
    position: relative; margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .cg-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #E5C158, transparent);
  }

  /* Event header */
  .cg-event-header {
    background: linear-gradient(135deg, rgba(16,44,30,0.7) 0%, rgba(4,7,6,0.4) 100%);
    padding: 26px 30px;
    border-bottom: 1px solid rgba(197,160,56,0.14);
    text-align: center;
  }
  .cg-event-lbl {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: #E5C158; margin-bottom: 5px; font-weight: 500;
  }
  .cg-event-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 500; color: #F5F0E8;
  }

  /* Details grid */
  .cg-details {
    display: grid; grid-template-columns: 1fr 1fr;
  }
  .cg-detail {
    padding: 22px 24px;
    border-right: 1px solid rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .cg-detail:nth-child(even) { border-right: none; }
  .cg-detail:nth-last-child(-n+2) { border-bottom: none; }
  .cg-detail.full { grid-column: 1 / -1; border-right: none; }

  .cg-det-icon {
    width: 20px; height: 20px;
    color: #E5C158;
    margin-bottom: 9px;
    stroke-width: 1.5px;
  }
  .cg-det-lbl {
    font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
    color: #E5C158; margin-bottom: 6px; font-weight: 500;
  }
  .cg-det-val { font-size: 14px; font-weight: 400; color: #F3EFE9; line-height: 1.45; }

  /* VIP Access Banner */
  .cg-banner {
    background: linear-gradient(135deg, rgba(16,44,30,0.7) 0%, rgba(30,86,54,0.25) 100%);
    border: 1px solid rgba(46,125,80,0.28);
    border-radius: 4px; padding: 16px 22px;
    display: flex; align-items: center; gap: 15px;
    margin-bottom: 20px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    animation: cg-fadeUp 0.9s ease 0.3s both;
  }
  .cg-ban-icon-wrap {
    width: 40px; height: 40px;
    background: rgba(46,125,80,0.18);
    border: 1px solid rgba(46,125,80,0.38);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cg-ban-icon-svg {
    width: 20px; height: 20px;
    color: #86EFAC;
    stroke-width: 1.5px;
  }
  .cg-ban-txt strong { display: block; font-size: 14px; font-weight: 600; color: #86EFAC; margin-bottom: 2px; }
  .cg-ban-txt span { font-size: 12px; color: #8C9F95; line-height: 1.4; }

  /* RSVP Section */
  .cg-rsvp-hd { padding: 26px 30px 0; text-align: center; }
  .cg-rsvp-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 400; color: #F5F0E8; letter-spacing: 0.4px;
    margin-bottom: 5px;
  }
  .cg-rsvp-sub { font-size: 12px; color: #8C9F95; }

  .cg-rsvp-bd { padding: 22px 30px 30px; }

  .cg-fgrp { margin-bottom: 17px; }
  .cg-lbl {
    display: block; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: #E5C158; font-weight: 500; margin-bottom: 8px;
  }
  .cg-lbl-opt { color: #8C9F95; font-size: 9px; letter-spacing: 1px; }

  .cg-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(197,160,56,0.2);
    border-radius: 2px; padding: 13px 15px;
    font-size: 15px; font-family: 'Outfit', sans-serif;
    font-weight: 300; color: #F3EFE9; outline: none;
    transition: border-color 0.25s, background 0.25s;
    letter-spacing: 0.3px;
  }
  .cg-input:focus { border-color: rgba(229,193,88,0.5); background: rgba(255,255,255,0.05); }
  .cg-input::placeholder { color: rgba(140,159,149,0.45); font-weight: 300; }
  .cg-input.err { border-color: rgba(239,68,68,0.5) !important; }

  .cg-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px; }
  .cg-choice {
    padding: 15px 10px;
    border: 1px solid rgba(197,160,56,0.2); border-radius: 2px;
    background: transparent; color: #8C9F95;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.22s;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    letter-spacing: 0.3px;
  }
  .cg-choice .ci {
    width: 20px; height: 20px;
    stroke-width: 2px;
  }
  .cg-choice:hover { border-color: rgba(197,160,56,0.4); color: #F3EFE9; background: rgba(197,160,56,0.04); }
  .cg-choice.yes-active { background: rgba(16,44,30,0.5); border-color: rgba(46,125,80,0.5); color: #86EFAC; }
  .cg-choice.yes-active .ci { color: #86EFAC; }
  .cg-choice.no-active  { background: rgba(60,20,20,0.4); border-color: rgba(150,60,60,0.4); color: #FCA5A5; }
  .cg-choice.no-active .ci { color: #FCA5A5; }
  .cg-choice.err-shake  { animation: cg-shake 0.4s ease; }

  .cg-err-msg { font-size: 11px; color: #FCA5A5; margin-top: 5px; display: none; }
  .cg-err-msg.show { display: block; }

  .cg-submit {
    width: 100%; margin-top: 22px;
    background: linear-gradient(135deg, #102C1E 0%, #205636 50%, #102C1E 100%);
    border: 1px solid #C5A038; border-radius: 2px; padding: 16px;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase; color: #E5C158;
    cursor: pointer; transition: all 0.28s; position: relative; overflow: hidden;
  }
  .cg-submit::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(229,193,88,0.12) 0%, transparent 50%, rgba(229,193,88,0.12) 100%);
    opacity: 0; transition: opacity 0.28s;
  }
  .cg-submit:hover::before { opacity: 1; }
  .cg-submit:hover { box-shadow: 0 4px 28px rgba(229,193,88,0.22), 0 0 0 1px rgba(229,193,88,0.3); transform: translateY(-1px); }
  .cg-submit:active { transform: translateY(0); }
  .cg-submit:disabled { opacity: 0.38; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Success UI */
  .cg-success { text-align: center; animation: cg-fadeUp 0.6s ease both; }
  .cg-seal {
    width: 78px; height: 78px;
    background: linear-gradient(135deg, #102C1E, #205636);
    border: 2px solid #E5C158; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    box-shadow: 0 0 36px rgba(229,193,88,0.22);
    animation: cg-popIn 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.15s both;
  }
  .cg-seal-svg {
    width: 38px; height: 38px;
    color: #E5C158;
    stroke-width: 2px;
  }
  .cg-s-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #E5C158; margin-bottom: 9px; }
  .cg-s-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px; font-weight: 400; color: #F5F0E8; margin-bottom: 11px; line-height: 1.2;
  }
  .cg-s-msg { font-size: 14px; color: #8C9F95; line-height: 1.7; max-width: 320px; margin: 0 auto 22px; }
  .cg-s-box {
    background: rgba(16,44,30,0.3);
    border: 1px solid rgba(46,125,80,0.3); border-radius: 4px; padding: 18px 22px;
    box-shadow: inset 0 1px 10px rgba(0,0,0,0.4);
  }
  .cg-s-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: left; }
  .cg-s-row:last-child { border-bottom: none; padding-bottom: 0; }
  .cg-s-row:first-child { padding-top: 0; }
  
  .cg-s-ico {
    width: 16px; height: 16px;
    color: #E5C158;
    flex-shrink: 0;
    stroke-width: 1.8px;
  }
  .cg-s-txt { font-size: 13px; color: #F3EFE9; font-weight: 300; }
  .cg-s-txt strong { font-weight: 600; color: #E5C158; }

  /* Footer */
  .cg-footer { text-align: center; margin-top: 40px; animation: cg-fadeUp 0.9s ease 0.6s both; }
  .cg-ft-div { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .cg-ft-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
  .cg-ft-dia { width: 5px; height: 5px; background: #C5A038; transform: rotate(45deg); }
  .cg-ft-txt { font-size: 12px; color: #8C9F95; line-height: 1.7; letter-spacing: 0.2px; }
  .cg-ft-brand { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 400; color: #E5C158; margin-top: 5px; letter-spacing: 1px; }

  /* Animations */
  @keyframes cg-fadeDown { from { opacity: 0; transform: translateY(-22px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cg-fadeUp   { from { opacity: 0; transform: translateY(22px);  } to { opacity: 1; transform: translateY(0); } }
  @keyframes cg-popIn {
    0%   { transform: scale(0) rotate(-18deg); opacity: 0; }
    70%  { transform: scale(1.1) rotate(3deg); }
    100% { transform: scale(1) rotate(0deg);   opacity: 1; }
  }
  @keyframes cg-shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-5px); }
    40%,80% { transform: translateX(5px); }
  }

  @media (max-width: 400px) {
    .cg-details { grid-template-columns: 1fr; }
    .cg-detail { border-right: none !important; grid-column: auto !important; }
    .cg-rsvp-bd { padding: 18px 18px 26px; }
    .cg-rsvp-hd { padding: 22px 18px 0; }
  }
`;

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function CoralGablesOpening() {
  const [choice, setChoice] = useState(null);   // 'yes' | 'no'
  const [name, setName]     = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [nameErr, setNameErr] = useState(false);
  const [choiceErr, setChoiceErr] = useState(false);

  const selectChoice = (v) => {
    setChoice(v);
    setChoiceErr(false);
  };

  const submit = async () => {
    let valid = true;
    if (!name.trim())  { setNameErr(true);   valid = false; }
    if (!choice)       { setChoiceErr(true);  valid = false; }
    if (!valid) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rsvp_mortgage_opening')
        .insert([{ full_name: name.trim(), company: company.trim() || null, response: choice }]);

      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error('RSVP error:', err);
      alert('There was an issue submitting your response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="cg-root">
        <div className="cg-bg" />
        <div className="cg-gold-bar" />

        <div className="cg-wrap">

          {/* HEADER */}
          <div className="cg-header">
            <div className="cg-brand-logo">
              <h2 className="cg-brand-title">DHM Taxes &amp; More</h2>
              <span className="cg-brand-subtitle">Coral Gables Office</span>
            </div>
            <div className="cg-eyebrow">You are cordially invited</div>
            <h1 className="cg-h1">Grand Opening<br /><em>Reception</em></h1>
            <p className="cg-tagline">Celebrate the launch of our new premium office space in Coral Gables</p>
          </div>

          {!done ? (
            <>
              {/* EVENT DETAILS */}
              <div className="cg-card" style={{ animation: 'cg-fadeUp 0.9s ease 0.15s both' }}>
                <div className="cg-event-header">
                  <div className="cg-event-lbl">The Event</div>
                  <div className="cg-event-name">DHM Coral Gables — Ribbon Cutting &amp; Reception</div>
                </div>
                <div className="cg-details">
                  <div className="cg-detail">
                    <Calendar className="cg-det-icon" />
                    <div className="cg-det-lbl">Date</div>
                    <div className="cg-det-val">Saturday<br />June 20, 2026</div>
                  </div>
                  <div className="cg-detail">
                    <Clock className="cg-det-icon" />
                    <div className="cg-det-lbl">Time</div>
                    <div className="cg-det-val">4:00 PM<br />onwards</div>
                  </div>
                  <div className="cg-detail full">
                    <MapPin className="cg-det-icon" />
                    <div className="cg-det-lbl">Venue</div>
                    <div className="cg-det-val">770 Ponce de Leon Blvd<br />Suite 303, Miami, FL 33134</div>
                  </div>
                </div>
              </div>

              {/* VIP ACCESS BANNER */}
              <div className="cg-banner">
                <div className="cg-ban-icon-wrap">
                  <Sparkles className="cg-ban-icon-svg" />
                </div>
                <div className="cg-ban-txt">
                  <strong>VIP Access Granted</strong>
                  <span>Complimentary cocktails, exclusive networking, and property walkthrough.</span>
                </div>
              </div>

              {/* RSVP FORM */}
              <div className="cg-card" style={{ animation: 'cg-fadeUp 0.9s ease 0.4s both' }}>
                <div className="cg-rsvp-hd">
                  <div className="cg-ornament">
                    <div className="cg-orn-line" />
                    <div className="cg-orn-diamond" />
                    <div className="cg-orn-line cg-orn-line-r" />
                  </div>
                  <div className="cg-rsvp-title">Kindly Confirm Attendance</div>
                  <p className="cg-rsvp-sub">Please respond by June 18, 2026</p>
                  <div className="cg-ornament" style={{ marginBottom: 0 }}>
                    <div className="cg-orn-line" />
                    <div className="cg-orn-diamond" />
                    <div className="cg-orn-line cg-orn-line-r" />
                  </div>
                </div>

                <div className="cg-rsvp-bd">
                  {/* Name */}
                  <div className="cg-fgrp">
                    <label className="cg-lbl">Full Name</label>
                    <input
                      className={`cg-input${nameErr ? ' err' : ''}`}
                      placeholder="Your full name"
                      value={name}
                      onChange={e => { setName(e.target.value); setNameErr(false); }}
                    />
                    <div className={`cg-err-msg${nameErr ? ' show' : ''}`}>Please enter your name.</div>
                  </div>

                  {/* Company */}
                  <div className="cg-fgrp">
                    <label className="cg-lbl">
                      Company / Title <span className="cg-lbl-opt">(Optional)</span>
                    </label>
                    <input
                      className="cg-input"
                      placeholder="Your firm or role"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                    />
                  </div>

                  {/* Choice */}
                  <label className="cg-lbl">Your Response</label>
                  <div className="cg-choices">
                    <button
                      type="button"
                      className={`cg-choice${choice === 'yes' ? ' yes-active' : ''}${choiceErr ? ' err-shake' : ''}`}
                      onClick={() => selectChoice('yes')}
                    >
                      <Check className="ci" />
                      Gladly Accept
                    </button>
                    <button
                      type="button"
                      className={`cg-choice${choice === 'no' ? ' no-active' : ''}${choiceErr ? ' err-shake' : ''}`}
                      onClick={() => selectChoice('no')}
                    >
                      <X className="ci" />
                      Regretfully Decline
                    </button>
                  </div>
                  <div className={`cg-err-msg${choiceErr ? ' show' : ''}`}>Please select your response.</div>

                  <button
                    className="cg-submit"
                    onClick={submit}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Confirm Response'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* SUCCESS VIEW */
            <div className="cg-card cg-success" style={{ padding: '36px 28px 32px' }}>
              <div className="cg-ornament">
                <div className="cg-orn-line" />
                <div className="cg-orn-diamond" />
                <div className="cg-orn-line cg-orn-line-r" />
              </div>
              <div className="cg-seal">
                {choice === 'yes' ? <CheckCircle2 className="cg-seal-svg" /> : <X className="cg-seal-svg" />}
              </div>

              {choice === 'yes' ? (
                <>
                  <div className="cg-s-eyebrow">Reservation Confirmed</div>
                  <div className="cg-s-title">We look forward to<br />seeing you, {name.split(' ')[0]}</div>
                  <p className="cg-s-msg">
                    Your attendance has been noted. We are honored to celebrate this new chapter with you.
                    An extraordinary evening awaits.
                  </p>
                  <div className="cg-s-box">
                    <div className="cg-s-row">
                      <Calendar className="cg-s-ico" />
                      <div className="cg-s-txt">Saturday, <strong>June 20, 2026 · 4:00 PM</strong></div>
                    </div>
                    <div className="cg-s-row">
                      <MapPin className="cg-s-ico" />
                      <div className="cg-s-txt"><strong>770 Ponce de Leon Blvd, Suite 303, Miami, FL</strong></div>
                    </div>
                    <div className="cg-s-row">
                      <Sparkles className="cg-s-ico" />
                      <div className="cg-s-txt">Complimentary cocktails &amp; networking included</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="cg-s-eyebrow">Response Received</div>
                  <div className="cg-s-title">Thank you, {name.split(' ')[0]}</div>
                  <p className="cg-s-msg">
                    We appreciate your kind response and regret you cannot join us.
                    We look forward to connecting with you soon.
                  </p>
                </>
              )}

              <div className="cg-ornament" style={{ marginTop: 24, marginBottom: 0 }}>
                <div className="cg-orn-line" />
                <div className="cg-orn-diamond" />
                <div className="cg-orn-line cg-orn-line-r" />
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="cg-footer">
            <div className="cg-ft-div">
              <div className="cg-ft-line" />
              <div className="cg-ft-dia" />
              <div className="cg-ft-line" />
            </div>
            <div className="cg-ft-txt">
              Hosted by DHM Taxes &amp; More<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(140,159,149,0.6)' }}>
                Private VIP invitation — please do not forward
              </em>
            </div>
            <div className="cg-ft-brand">DHM Taxes &amp; More™</div>
          </div>

        </div>
      </div>
    </>
  );
}
