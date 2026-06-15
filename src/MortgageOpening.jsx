import { useState } from 'react';
import { supabase } from './lib/supabase';

/* ─── INLINE STYLES ─────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

  .mo-root {
    font-family: 'Outfit', sans-serif;
    background: #060908;
    color: #F0EDE6;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  .mo-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 100% 65% at 50% 0%, rgba(26,61,43,0.60) 0%, transparent 65%),
      radial-gradient(ellipse 55% 45% at 10% 85%, rgba(184,151,58,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 45% 40% at 90% 55%, rgba(26,61,43,0.22) 0%, transparent 50%),
      #060908;
    pointer-events: none;
  }

  .mo-gold-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 100;
    background: linear-gradient(90deg, transparent 0%, #B8973A 30%, #D4AF5A 50%, #B8973A 70%, transparent 100%);
  }

  .mo-wrap {
    position: relative; z-index: 1;
    max-width: 520px;
    margin: 0 auto;
    padding: 0 20px 80px;
  }

  /* Header */
  .mo-header {
    padding: 52px 0 32px;
    text-align: center;
    animation: mo-fadeDown 0.9s ease both;
  }

  .mo-logos {
    display: flex; align-items: center; justify-content: center;
    gap: 22px; margin-bottom: 36px;
  }

  .mo-logo-dhm {
    height: 54px; width: auto;
    filter: brightness(0) invert(1);
  }

  .mo-logo-sep {
    width: 1px; height: 52px;
    background: linear-gradient(to bottom, transparent, #B8973A, transparent);
    flex-shrink: 0;
  }

  .mo-logo-bond {
    height: 62px; width: auto; border-radius: 50%;
    box-shadow: 0 0 20px rgba(184,151,58,0.2);
  }

  /* Typography */
  .mo-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; font-weight: 500;
    letter-spacing: 3.5px; text-transform: uppercase;
    color: #D4AF5A; margin-bottom: 18px;
  }
  .mo-eyebrow::before, .mo-eyebrow::after {
    content: ''; display: inline-block;
    width: 24px; height: 1px;
    background: linear-gradient(to right, transparent, #B8973A);
  }
  .mo-eyebrow::after { background: linear-gradient(to left, transparent, #B8973A); }

  .mo-h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(40px, 10vw, 60px);
    font-weight: 300; line-height: 1.06;
    color: #F5F0E8; margin-bottom: 10px; letter-spacing: -0.5px;
  }
  .mo-h1 em { font-style: italic; color: #D4AF5A; }

  .mo-tagline {
    font-size: 14px; font-weight: 300;
    color: #8A8A7A; letter-spacing: 0.4px;
  }

  /* Ornament */
  .mo-ornament {
    display: flex; align-items: center; gap: 12px; margin: 28px 0;
  }
  .mo-orn-line {
    flex: 1; height: 1px;
    background: linear-gradient(to right, transparent, rgba(184,151,58,0.3));
  }
  .mo-orn-line-r { background: linear-gradient(to left, transparent, rgba(184,151,58,0.3)); }
  .mo-orn-diamond {
    width: 6px; height: 6px;
    background: #B8973A; transform: rotate(45deg); flex-shrink: 0;
  }

  /* Cards */
  .mo-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(184,151,58,0.18);
    border-radius: 4px; overflow: hidden;
    position: relative; margin-bottom: 20px;
  }
  .mo-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #D4AF5A, transparent);
  }

  /* Event header */
  .mo-event-header {
    background: linear-gradient(135deg, rgba(26,61,43,0.65) 0%, rgba(6,9,8,0.4) 100%);
    padding: 26px 30px;
    border-bottom: 1px solid rgba(184,151,58,0.14);
    text-align: center;
  }
  .mo-event-lbl {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: #B8973A; margin-bottom: 5px; font-weight: 500;
  }
  .mo-event-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 500; color: #F5F0E8;
  }

  /* Details grid */
  .mo-details {
    display: grid; grid-template-columns: 1fr 1fr;
  }
  .mo-detail {
    padding: 20px 24px;
    border-right: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .mo-detail:nth-child(even) { border-right: none; }
  .mo-detail:nth-last-child(-n+2) { border-bottom: none; }
  .mo-detail.full { grid-column: 1 / -1; border-right: none; }

  .mo-det-icon { font-size: 17px; margin-bottom: 7px; display: block; }
  .mo-det-lbl {
    font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
    color: #B8973A; margin-bottom: 4px; font-weight: 500;
  }
  .mo-det-val { font-size: 14px; font-weight: 400; color: #F0EDE6; line-height: 1.45; }

  /* Banner */
  .mo-banner {
    background: linear-gradient(135deg, rgba(26,61,43,0.7) 0%, rgba(45,106,71,0.25) 100%);
    border: 1px solid rgba(62,140,96,0.28);
    border-radius: 4px; padding: 16px 22px;
    display: flex; align-items: center; gap: 15px;
    margin-bottom: 20px;
    animation: mo-fadeUp 0.9s ease 0.3s both;
  }
  .mo-ban-icon {
    width: 42px; height: 42px;
    background: rgba(62,140,96,0.18);
    border: 1px solid rgba(62,140,96,0.38);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px; flex-shrink: 0;
  }
  .mo-ban-txt strong { display: block; font-size: 14px; font-weight: 600; color: #86EFAC; margin-bottom: 2px; }
  .mo-ban-txt span { font-size: 12px; color: #8A8A7A; line-height: 1.4; }

  /* RSVP */
  .mo-rsvp-hd { padding: 26px 30px 0; text-align: center; }
  .mo-rsvp-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 400; color: #F5F0E8; letter-spacing: 0.4px;
    margin-bottom: 5px;
  }
  .mo-rsvp-sub { font-size: 12px; color: #8A8A7A; }

  .mo-rsvp-bd { padding: 22px 30px 30px; }

  .mo-fgrp { margin-bottom: 17px; }
  .mo-lbl {
    display: block; font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: #B8973A; font-weight: 500; margin-bottom: 8px;
  }
  .mo-lbl-opt { color: #8A8A7A; font-size: 9px; letter-spacing: 1px; }

  .mo-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(184,151,58,0.2);
    border-radius: 2px; padding: 13px 15px;
    font-size: 15px; font-family: 'Outfit', sans-serif;
    font-weight: 300; color: #F0EDE6; outline: none;
    transition: border-color 0.25s, background 0.25s;
    letter-spacing: 0.3px;
  }
  .mo-input:focus { border-color: rgba(184,151,58,0.5); background: rgba(255,255,255,0.06); }
  .mo-input::placeholder { color: rgba(138,138,122,0.45); font-weight: 300; }
  .mo-input.err { border-color: rgba(239,68,68,0.5) !important; }

  .mo-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 6px; }
  .mo-choice {
    padding: 15px 10px;
    border: 1px solid rgba(184,151,58,0.2); border-radius: 2px;
    background: transparent; color: #8A8A7A;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.22s;
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    letter-spacing: 0.3px;
  }
  .mo-choice .ci { font-size: 21px; }
  .mo-choice:hover { border-color: rgba(184,151,58,0.4); color: #F0EDE6; background: rgba(184,151,58,0.04); }
  .mo-choice.yes-active { background: rgba(26,61,43,0.5); border-color: rgba(62,140,96,0.5); color: #86EFAC; }
  .mo-choice.no-active  { background: rgba(60,20,20,0.4); border-color: rgba(150,60,60,0.4); color: #FCA5A5; }
  .mo-choice.err-shake  { animation: mo-shake 0.4s ease; }

  .mo-err-msg { font-size: 11px; color: #FCA5A5; margin-top: 5px; display: none; }
  .mo-err-msg.show { display: block; }

  .mo-submit {
    width: 100%; margin-top: 22px;
    background: linear-gradient(135deg, #1A3D2B 0%, #2D6A47 50%, #1A3D2B 100%);
    border: 1px solid #B8973A; border-radius: 2px; padding: 16px;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase; color: #D4AF5A;
    cursor: pointer; transition: all 0.28s; position: relative; overflow: hidden;
  }
  .mo-submit::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(184,151,58,0.12) 0%, transparent 50%, rgba(184,151,58,0.12) 100%);
    opacity: 0; transition: opacity 0.28s;
  }
  .mo-submit:hover::before { opacity: 1; }
  .mo-submit:hover { box-shadow: 0 4px 28px rgba(184,151,58,0.22), 0 0 0 1px rgba(184,151,58,0.3); transform: translateY(-1px); }
  .mo-submit:active { transform: translateY(0); }
  .mo-submit:disabled { opacity: 0.38; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Success */
  .mo-success { text-align: center; animation: mo-fadeUp 0.6s ease both; }
  .mo-seal {
    width: 78px; height: 78px;
    background: linear-gradient(135deg, #1A3D2B, #2D6A47);
    border: 2px solid #B8973A; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 34px; margin: 0 auto 22px;
    box-shadow: 0 0 36px rgba(184,151,58,0.22);
    animation: mo-popIn 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.15s both;
  }
  .mo-s-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #B8973A; margin-bottom: 9px; }
  .mo-s-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px; font-weight: 400; color: #F5F0E8; margin-bottom: 11px; line-height: 1.2;
  }
  .mo-s-msg { font-size: 14px; color: #8A8A7A; line-height: 1.7; max-width: 320px; margin: 0 auto 22px; }
  .mo-s-box {
    background: rgba(26,61,43,0.3);
    border: 1px solid rgba(62,140,96,0.3); border-radius: 4px; padding: 18px 22px;
  }
  .mo-s-row { display: flex; align-items: center; gap: 11px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left; }
  .mo-s-row:last-child { border-bottom: none; padding-bottom: 0; }
  .mo-s-row:first-child { padding-top: 0; }
  .mo-s-ico { font-size: 15px; flex-shrink: 0; }
  .mo-s-txt { font-size: 13px; color: #F0EDE6; font-weight: 300; }
  .mo-s-txt strong { font-weight: 600; color: #D4AF5A; }

  /* Partnership */
  .mo-partnership { text-align: center; margin-top: 28px; animation: mo-fadeUp 0.9s ease 0.5s both; }
  .mo-pt-lbl { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #8A8A7A; margin-bottom: 11px; }
  .mo-pt-logos { display: flex; align-items: center; justify-content: center; gap: 18px; }
  .mo-pt-dhm { height: 30px; width: auto; filter: brightness(0) invert(1); opacity: 0.55; }
  .mo-pt-bond { height: 34px; width: auto; opacity: 0.45; border-radius: 50%; }
  .mo-pt-x { font-size: 11px; color: #8A8A7A; letter-spacing: 2px; }

  /* Footer */
  .mo-footer { text-align: center; margin-top: 36px; animation: mo-fadeUp 0.9s ease 0.6s both; }
  .mo-ft-div { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .mo-ft-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .mo-ft-dia { width: 5px; height: 5px; background: #B8973A; transform: rotate(45deg); }
  .mo-ft-txt { font-size: 12px; color: #8A8A7A; line-height: 1.7; letter-spacing: 0.2px; }
  .mo-ft-brand { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 400; color: #D4AF5A; margin-top: 5px; letter-spacing: 1px; }

  /* Animations */
  @keyframes mo-fadeDown { from { opacity: 0; transform: translateY(-22px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes mo-fadeUp   { from { opacity: 0; transform: translateY(22px);  } to { opacity: 1; transform: translateY(0); } }
  @keyframes mo-popIn {
    0%   { transform: scale(0) rotate(-18deg); opacity: 0; }
    70%  { transform: scale(1.1) rotate(3deg); }
    100% { transform: scale(1) rotate(0deg);   opacity: 1; }
  }
  @keyframes mo-shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-5px); }
    40%,80% { transform: translateX(5px); }
  }

  @media (max-width: 400px) {
    .mo-details { grid-template-columns: 1fr; }
    .mo-detail { border-right: none !important; grid-column: auto !important; }
    .mo-rsvp-bd { padding: 18px 18px 26px; }
    .mo-rsvp-hd { padding: 22px 18px 0; }
  }
`;

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function MortgageOpening() {
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

      <div className="mo-root">
        <div className="mo-bg" />
        <div className="mo-gold-bar" />

        <div className="mo-wrap">

          {/* HEADER */}
          <div className="mo-header">
            <div className="mo-logos">
              <img src="/dhm-mortgage-logo.png" alt="DHM Mortgage" className="mo-logo-dhm" />
              <div className="mo-logo-sep" />
              <img src="/bond-street-logo.png"  alt="Bond Street Mortgage" className="mo-logo-bond" />
            </div>
            <div className="mo-eyebrow">You are cordially invited</div>
            <h1 className="mo-h1">Grand Opening<br /><em>Reception</em></h1>
            <p className="mo-tagline">An exclusive evening celebrating the launch of DHM Mortgage</p>
          </div>

          {!done ? (
            <>
              {/* EVENT DETAILS */}
              <div className="mo-card" style={{ animation: 'mo-fadeUp 0.9s ease 0.15s both' }}>
                <div className="mo-event-header">
                  <div className="mo-event-lbl">The Event</div>
                  <div className="mo-event-name">DHM Mortgage — Official Launch</div>
                </div>
                <div className="mo-details">
                  <div className="mo-detail">
                    <span className="mo-det-icon">📅</span>
                    <div className="mo-det-lbl">Date</div>
                    <div className="mo-det-val">Tuesday<br />June 2, 2026</div>
                  </div>
                  <div className="mo-detail">
                    <span className="mo-det-icon">🕔</span>
                    <div className="mo-det-lbl">Time</div>
                    <div className="mo-det-val">4:00 PM<br />onwards</div>
                  </div>
                  <div className="mo-detail full">
                    <span className="mo-det-icon">📍</span>
                    <div className="mo-det-lbl">Venue</div>
                    <div className="mo-det-val">Restaurant Cured<br />637 E Main St, Louisville, KY 40202</div>
                  </div>
                </div>
              </div>

              {/* COMPLIMENTARY BANNER */}
              <div className="mo-banner">
                <div className="mo-ban-icon">🥂</div>
                <div className="mo-ban-txt">
                  <strong>Fully Hosted Evening</strong>
                  <span>Cocktails &amp; networking — compliments of DHM Mortgage</span>
                </div>
              </div>

              {/* RSVP */}
              <div className="mo-card" style={{ animation: 'mo-fadeUp 0.9s ease 0.4s both' }}>
                <div className="mo-rsvp-hd">
                  <div className="mo-ornament">
                    <div className="mo-orn-line" />
                    <div className="mo-orn-diamond" />
                    <div className="mo-orn-line mo-orn-line-r" />
                  </div>
                  <div className="mo-rsvp-title">Kindly Confirm Attendance</div>
                  <p className="mo-rsvp-sub">Please respond by May 28, 2026</p>
                  <div className="mo-ornament" style={{ marginBottom: 0 }}>
                    <div className="mo-orn-line" />
                    <div className="mo-orn-diamond" />
                    <div className="mo-orn-line mo-orn-line-r" />
                  </div>
                </div>

                <div className="mo-rsvp-bd">
                  {/* Name */}
                  <div className="mo-fgrp">
                    <label className="mo-lbl">Full Name</label>
                    <input
                      className={`mo-input${nameErr ? ' err' : ''}`}
                      placeholder="Your full name"
                      value={name}
                      onChange={e => { setName(e.target.value); setNameErr(false); }}
                    />
                    <div className={`mo-err-msg${nameErr ? ' show' : ''}`}>Please enter your name.</div>
                  </div>

                  {/* Company */}
                  <div className="mo-fgrp">
                    <label className="mo-lbl">
                      Company / Title <span className="mo-lbl-opt">(Optional)</span>
                    </label>
                    <input
                      className="mo-input"
                      placeholder="Your firm or role"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                    />
                  </div>

                  {/* Choice */}
                  <label className="mo-lbl">Your Response</label>
                  <div className="mo-choices">
                    <button
                      className={`mo-choice${choice === 'yes' ? ' yes-active' : ''}${choiceErr ? ' err-shake' : ''}`}
                      onClick={() => selectChoice('yes')}
                    >
                      <span className="ci">✅</span>
                      Gladly Accept
                    </button>
                    <button
                      className={`mo-choice${choice === 'no' ? ' no-active' : ''}${choiceErr ? ' err-shake' : ''}`}
                      onClick={() => selectChoice('no')}
                    >
                      <span className="ci">🙏</span>
                      Regretfully Decline
                    </button>
                  </div>
                  <div className={`mo-err-msg${choiceErr ? ' show' : ''}`}>Please select your response.</div>

                  <button
                    className="mo-submit"
                    onClick={submit}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Confirm Response'}
                  </button>
                </div>
              </div>

              {/* PARTNERSHIP */}
              <div className="mo-partnership">
                <div className="mo-pt-lbl">In partnership with</div>
                <div className="mo-pt-logos">
                  <img src="/dhm-mortgage-logo.png" className="mo-pt-dhm" alt="DHM Mortgage" />
                  <span className="mo-pt-x">&amp;</span>
                  <img src="/bond-street-logo.png"  className="mo-pt-bond" alt="Bond Street Mortgage" />
                </div>
              </div>
            </>
          ) : (
            /* SUCCESS */
            <div className="mo-card mo-success" style={{ padding: '36px 28px 32px' }}>
              <div className="mo-ornament">
                <div className="mo-orn-line" />
                <div className="mo-orn-diamond" />
                <div className="mo-orn-line mo-orn-line-r" />
              </div>
              <div className="mo-seal">{choice === 'yes' ? '✓' : '♡'}</div>

              {choice === 'yes' ? (
                <>
                  <div className="mo-s-eyebrow">Reservation Confirmed</div>
                  <div className="mo-s-title">We look forward to<br />seeing you, {name.split(' ')[0]}</div>
                  <p className="mo-s-msg">
                    Your attendance has been noted. We are honored to celebrate this milestone with you.
                    An extraordinary evening awaits.
                  </p>
                  <div className="mo-s-box">
                    <div className="mo-s-row">
                      <span className="mo-s-ico">📅</span>
                      <div className="mo-s-txt">Tuesday, <strong>June 2, 2026 · 4:00 PM</strong></div>
                    </div>
                    <div className="mo-s-row">
                      <span className="mo-s-ico">📍</span>
                      <div className="mo-s-txt">Restaurant Cured · <strong>637 E Main St, Louisville, KY</strong></div>
                    </div>
                    <div className="mo-s-row">
                      <span className="mo-s-ico">🥂</span>
                      <div className="mo-s-txt">Cocktails &amp; networking <strong>fully hosted</strong> by DHM Mortgage</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mo-s-eyebrow">Response Received</div>
                  <div className="mo-s-title">Thank you, {name.split(' ')[0]}</div>
                  <p className="mo-s-msg">
                    We appreciate your kind response and regret you cannot join us.
                    We look forward to connecting with you soon.
                  </p>
                </>
              )}

              <div className="mo-ornament" style={{ marginTop: 24, marginBottom: 0 }}>
                <div className="mo-orn-line" />
                <div className="mo-orn-diamond" />
                <div className="mo-orn-line mo-orn-line-r" />
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mo-footer">
            <div className="mo-ft-div">
              <div className="mo-ft-line" />
              <div className="mo-ft-dia" />
              <div className="mo-ft-line" />
            </div>
            <div className="mo-ft-txt">
              Hosted by Darien · DHM Taxes &amp; More<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(138,138,122,0.6)' }}>
                Private invitation — please do not forward
              </em>
            </div>
            <div className="mo-ft-brand">DHM Mortgage™</div>
          </div>

        </div>
      </div>
    </>
  );
}
