import React from 'react';

const TIPS = [
  {
    title: '🌱 Seasonal Farming Tips',
    color: 'result-box-green',
    titleColor: 'text-neon',
    items: [
      { head: 'Kharif Season (June–Oct):', points: ['Best for rice, cotton, maize', 'Ensure good drainage', 'Monitor for monsoon pests'] },
      { head: 'Rabi Season (Nov–Mar):', points: ['Ideal for wheat, mustard', 'Manage irrigation carefully', 'Protect from frost damage'] },
    ],
  },
  {
    title: '🌍 Soil Health Management',
    color: 'result-box-blue',
    titleColor: 'text-blue-400',
    items: [{ points: ['Test soil pH every 2–3 years', 'Add organic manure regularly', 'Practice crop rotation', 'Avoid over-fertilization', 'Use cover crops in off-season', 'Maintain proper drainage'] }],
  },
  {
    title: '💧 Water Management',
    color: 'result-box-orange',
    titleColor: 'text-orange-400',
    items: [{ points: ['Drip irrigation saves 40% water', 'Water early morning or evening', 'Mulching reduces evaporation', 'Check soil moisture before irrigation', 'Harvest rainwater when possible'] }],
  },
  {
    title: '🏛️ Government Schemes',
    color: 'result-box-green',
    titleColor: 'text-neon',
    items: [{ points: ['PM-KISAN: ₹6000/year direct benefit', 'Soil Health Card Scheme', 'Pradhan Mantri Fasal Bima Yojana', 'KCC: Kisan Credit Card', 'e-NAM: National Agriculture Market'] }],
  },
  {
    title: '📞 Important Contacts',
    color: 'result-box-blue',
    titleColor: 'text-blue-400',
    items: [{ points: ['Kisan Call Centre: 1800-180-1551', 'Agricultural Officer: Contact local office', 'Soil Testing Lab: Check district centre', 'Mandi Bhav: 1800-270-0224', 'e-NAM Helpline: 1800-270-0224'] }],
  },
];

export default function TipsTab() {
  return (
    <div className="space-y-4">
      {TIPS.map((section) => (
        <div key={section.title} className={`result-box ${section.color}`}>
          <p className={`result-title ${section.titleColor}`}>{section.title}</p>
          {section.items.map((block, bi) => (
            <div key={bi} className="mb-3 last:mb-0">
              {block.head && (
                <p className="font-grotesk text-[12px] text-cream/70 uppercase tracking-wide mb-2">{block.head}</p>
              )}
              {block.points.map((pt, pi) => (
                <p key={pi} className="font-mono text-[13px] text-cream/65 mb-1">• {pt}</p>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
