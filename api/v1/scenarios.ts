import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const scenarios = [
    {
      id: 'food_substitution',
      name: 'Food Substitution',
      description: 'Switch between different protein sources',
      examples: ['Switch from beef to chicken twice per week'],
      icon: '🍖',
    },
    {
      id: 'transport_substitution',
      name: 'Transport Substitution',
      description: 'Change how you get around',
      examples: ['Bike instead of Uber twice a week'],
      icon: '🚲',
    },
    {
      id: 'plastic_ban',
      name: 'Plastic Ban',
      description: 'Model policy-level plastic restrictions',
      examples: ['What if my city bans single-use plastic bags?'],
      icon: '🛍️',
    },
    {
      id: 'reusable_adoption',
      name: 'Reusable Adoption',
      description: 'Switch from disposable to reusable items',
      examples: ['What if 30% of students use reusable bottles?'],
      icon: '♻️',
    },
  ];

  res.json({ scenarios });
}
