import React from 'react';
import './AuthBackground.css';

// c: 'blue' | 'green' | 'gold' | 'white'
const ITEMS = [
    { t: '₹',     x: 3,  s: 32, d: 0,    dur: 18, c: 'green' },
    { t: 'GST',   x: 8,  s: 14, d: 9,    dur: 22, c: 'blue'  },
    { t: '✓',     x: 5,  s: 18, d: 15,   dur: 19, c: 'green' },
    { t: '18%',   x: 14, s: 16, d: 4,    dur: 15, c: 'gold'  },
    { t: 'CGST',  x: 18, s: 12, d: 12,   dur: 20, c: 'blue'  },
    { t: '₹',     x: 11, s: 24, d: 7,    dur: 17, c: 'green' },
    { t: '12%',   x: 25, s: 17, d: 2,    dur: 16, c: 'gold'  },
    { t: 'BILL',  x: 29, s: 13, d: 11,   dur: 21, c: 'white' },
    { t: '₹',     x: 22, s: 36, d: 6,    dur: 14, c: 'green' },
    { t: 'TAX',   x: 38, s: 13, d: 3,    dur: 23, c: 'white' },
    { t: '28%',   x: 43, s: 16, d: 8,    dur: 16, c: 'gold'  },
    { t: '₹',     x: 50, s: 28, d: 1,    dur: 19, c: 'green' },
    { t: '#INV',  x: 47, s: 12, d: 14,   dur: 18, c: 'blue'  },
    { t: 'SGST',  x: 57, s: 12, d: 5,    dur: 22, c: 'blue'  },
    { t: '5%',    x: 62, s: 18, d: 10,   dur: 15, c: 'gold'  },
    { t: '₹',     x: 54, s: 22, d: 13,   dur: 17, c: 'green' },
    { t: 'HSN',   x: 71, s: 13, d: 0,    dur: 20, c: 'white' },
    { t: '18%',   x: 67, s: 15, d: 7,    dur: 18, c: 'gold'  },
    { t: '₹',     x: 76, s: 30, d: 4,    dur: 16, c: 'green' },
    { t: 'IGST',  x: 69, s: 12, d: 16,   dur: 21, c: 'blue'  },
    { t: 'GST',   x: 83, s: 14, d: 2,    dur: 19, c: 'blue'  },
    { t: '✓',     x: 87, s: 22, d: 9,    dur: 14, c: 'green' },
    { t: '₹',     x: 80, s: 20, d: 11,   dur: 22, c: 'green' },
    { t: '12%',   x: 92, s: 16, d: 6,    dur: 17, c: 'gold'  },
    { t: 'TAX',   x: 96, s: 13, d: 15,   dur: 20, c: 'white' },
    { t: '₹',     x: 89, s: 34, d: 3,    dur: 15, c: 'green' },
    { t: 'GSTIN', x: 34, s: 11, d: 17,   dur: 24, c: 'blue'  },
    { t: '₹',     x: 59, s: 15, d: 18,   dur: 13, c: 'green' },
    { t: '28%',   x: 78, s: 14, d: 19,   dur: 16, c: 'gold'  },
    { t: 'BILL',  x: 15, s: 13, d: 20,   dur: 18, c: 'white' },
];

const AuthBackground = () => (
    <div className="auth-anim-bg" aria-hidden="true">

        {/* Large centre watermark */}
        <div className="auth-watermark">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-watermark-logo">
                <path d="M38 4L14 36H28L20 60L50 24H34L38 4Z" fill="url(#wmGrad)" />
                <defs>
                    <linearGradient id="wmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="auth-watermark-text">GSTBLIZ</span>
        </div>

        {/* Floating items */}
        {ITEMS.map((item, i) => (
            <span
                key={i}
                className={`auth-anim-item auth-anim-${item.c}`}
                style={{
                    left: `${item.x}%`,
                    fontSize: `${item.s}px`,
                    animationDelay: `${item.d}s`,
                    animationDuration: `${item.dur}s`,
                }}
            >
                {item.t}
            </span>
        ))}
    </div>
);

export default AuthBackground;
