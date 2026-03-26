const svgToDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const createPoster = (title, palette) =>
  svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="360" height="520" rx="22" fill="url(#g)" />
      <circle cx="302" cy="72" r="82" fill="rgba(255,255,255,0.14)" />
      <circle cx="48" cy="458" r="124" fill="rgba(23,32,61,0.16)" />
      <rect x="28" y="28" width="304" height="464" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
      <text x="32" y="412" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" opacity="0.92">KERV Demo</text>
      <text x="32" y="446" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="800">${title}</text>
    </svg>
  `);

export const contentLibrary = [
  {
    id: 1,
    title: 'Parks and Recreation',
    category: 'Lifestyle',
    advertiserCategory: 'Retail',
    tier: 'Tier 1',
    adTypes: ['Organic Pause', 'CTA Pause'],
    thumbnail: createPoster('Parks & Rec', ['#f4bf5c', '#63c6bd']),
  },
  {
    id: 2,
    title: 'Yellowstone',
    category: 'Travel',
    advertiserCategory: 'Automotive',
    tier: 'Tier 3',
    adTypes: ['Sync Impulse', 'Ad Break'],
    thumbnail: createPoster('Yellowstone', ['#85633b', '#15181f']),
  },
  {
    id: 3,
    title: 'Below Deck',
    category: 'Travel',
    advertiserCategory: 'Hospitality',
    tier: 'Tier 1',
    adTypes: ['Organic Pause', 'CTA Pause'],
    thumbnail: createPoster('Below Deck', ['#3ab7dd', '#0c4aa1']),
  },
  {
    id: 4,
    title: 'Everybody Loves Raymond',
    category: 'Lifestyle',
    advertiserCategory: 'CPG',
    tier: 'Tier 2',
    adTypes: ['CTA Pause', 'Sync L Bar'],
    thumbnail: createPoster('Raymond', ['#6a7bd8', '#d6a34d']),
  },
  {
    id: 5,
    title: 'Ted',
    category: 'Comedy',
    advertiserCategory: 'QSR',
    tier: 'Tier 2',
    adTypes: ['CTA Pause', 'Sync Impulse'],
    thumbnail: createPoster('Ted', ['#73c76b', '#4b704a']),
  },
  {
    id: 6,
    title: 'Wolf Like Me',
    category: 'Drama',
    advertiserCategory: 'Entertainment',
    tier: 'Tier 3',
    adTypes: ['Sync L Bar', 'Ad Break'],
    thumbnail: createPoster('Wolf Like Me', ['#1f304f', '#b84b60']),
  },
  {
    id: 7,
    title: 'A.P. Bio',
    category: 'Comedy',
    advertiserCategory: 'Education',
    tier: 'Tier 2',
    adTypes: ['CTA Pause', 'Sync L Bar'],
    thumbnail: createPoster('A.P. Bio', ['#59bfd2', '#3f74b9']),
  },
  {
    id: 8,
    title: 'Top Chef',
    category: 'Food',
    advertiserCategory: 'CPG',
    tier: 'Tier 1',
    adTypes: ['Organic Pause'],
    thumbnail: createPoster('Top Chef', ['#f28b4a', '#991f3c']),
  },
  {
    id: 9,
    title: 'Grand Designs',
    category: 'Lifestyle',
    advertiserCategory: 'Home',
    tier: 'Tier 3',
    adTypes: ['Ad Break'],
    thumbnail: createPoster('Grand Designs', ['#8ca6db', '#3f4e7a']),
  },
  {
    id: 10,
    title: 'The Getaway',
    category: 'Travel',
    advertiserCategory: 'Retail',
    tier: 'Tier 1',
    adTypes: ['Organic Pause', 'CTA Pause'],
    thumbnail: createPoster('The Getaway', ['#dd6b7d', '#4d67d3']),
  },
];

export const tierOptions = ['Tier 1', 'Tier 2', 'Tier 3'];

export const adTypesByTier = {
  'Tier 1': ['Organic Pause', 'CTA Pause'],
  'Tier 2': ['CTA Pause', 'Sync Impulse', 'Sync L Bar'],
  'Tier 3': ['Sync Impulse', 'Sync L Bar', 'Ad Break'],
};
