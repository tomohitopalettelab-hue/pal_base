// フライヤーサイズ定義
export const FLYER_SIZES = [
  { id: 'a4', label: 'A4', width: 1240, height: 1754, desc: '210×297mm' },
  { id: 'a5', label: 'A5', width: 874, height: 1240, desc: '148×210mm' },
  { id: 'b5', label: 'B5', width: 1076, height: 1520, desc: '182×257mm' },
  { id: 'postcard', label: 'はがき', width: 591, height: 874, desc: '100×148mm' },
] as const;

export type FlyerSizeId = (typeof FLYER_SIZES)[number]['id'];

// テイスト（雰囲気）カラースキーム
export type FlyerTasteColors = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  subText: string;
};

export type FlyerTaste = {
  id: string;
  name: string;
  description: string;
  colors: FlyerTasteColors;
  headerStyle: React.CSSProperties;
  bodyStyle: React.CSSProperties;
  couponStyle: React.CSSProperties;
  footerStyle: React.CSSProperties;
};

export const FLYER_TASTES: FlyerTaste[] = [
  // 1. ポップ — 明るく元気、セール感
  {
    id: 'pop',
    name: 'ポップ',
    description: '明るく元気でセール感のあるデザイン',
    colors: {
      primary: '#FF6B35',
      secondary: '#FFD23F',
      accent: '#EE4266',
      bg: '#FFF8F0',
      text: '#2D2D2D',
      subText: '#666666',
    },
    headerStyle: {
      background: 'linear-gradient(135deg, #FF6B35 0%, #EE4266 100%)',
      color: '#FFFFFF',
      fontWeight: 900,
      borderRadius: '0 0 24px 24px',
      padding: '32px 24px',
      textAlign: 'center' as const,
      letterSpacing: '0.04em',
    },
    bodyStyle: {
      backgroundColor: '#FFF8F0',
      color: '#2D2D2D',
      padding: '24px',
      fontSize: '16px',
      lineHeight: 1.8,
      textAlign: 'center' as const,
    },
    couponStyle: {
      background: 'linear-gradient(135deg, #FFD23F 0%, #FF6B35 100%)',
      color: '#FFFFFF',
      borderRadius: '16px',
      padding: '20px 24px',
      margin: '16px',
      fontWeight: 800,
      textAlign: 'center' as const,
      boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
    },
    footerStyle: {
      backgroundColor: '#2D2D2D',
      color: '#FFFFFF',
      padding: '20px 24px',
      textAlign: 'center' as const,
      fontSize: '13px',
      borderRadius: '24px 24px 0 0',
    },
  },

  // 2. シンプル — ミニマル、余白多め
  {
    id: 'simple',
    name: 'シンプル',
    description: '洗練されたミニマルデザイン',
    colors: {
      primary: '#1A1A1A',
      secondary: '#555555',
      accent: '#0066CC',
      bg: '#FFFFFF',
      text: '#1A1A1A',
      subText: '#888888',
    },
    headerStyle: {
      backgroundColor: '#FFFFFF',
      color: '#1A1A1A',
      fontWeight: 700,
      padding: '48px 32px 24px',
      textAlign: 'left' as const,
      borderBottom: '2px solid #1A1A1A',
      letterSpacing: '0.06em',
    },
    bodyStyle: {
      backgroundColor: '#FFFFFF',
      color: '#333333',
      padding: '32px',
      fontSize: '15px',
      lineHeight: 2.0,
      textAlign: 'left' as const,
    },
    couponStyle: {
      backgroundColor: '#F5F5F5',
      color: '#1A1A1A',
      border: '1px solid #DDDDDD',
      borderRadius: '4px',
      padding: '20px 24px',
      margin: '16px 32px',
      fontWeight: 600,
      textAlign: 'center' as const,
    },
    footerStyle: {
      backgroundColor: '#FAFAFA',
      color: '#888888',
      padding: '20px 32px',
      textAlign: 'left' as const,
      fontSize: '12px',
      borderTop: '1px solid #EEEEEE',
    },
  },

  // 3. 和風 — 伝統的な和のテイスト
  {
    id: 'japanese',
    name: '和風',
    description: '日本の伝統美を感じるデザイン',
    colors: {
      primary: '#C53D43',
      secondary: '#B8860B',
      accent: '#2E4057',
      bg: '#FAF5EF',
      text: '#2E2218',
      subText: '#7B6B5D',
    },
    headerStyle: {
      backgroundColor: '#2E2218',
      color: '#FAF5EF',
      fontWeight: 700,
      padding: '36px 28px',
      textAlign: 'center' as const,
      borderBottom: '4px double #B8860B',
      letterSpacing: '0.12em',
    },
    bodyStyle: {
      backgroundColor: '#FAF5EF',
      color: '#2E2218',
      padding: '28px',
      fontSize: '15px',
      lineHeight: 2.0,
      textAlign: 'center' as const,
    },
    couponStyle: {
      backgroundColor: '#FFFFFF',
      color: '#C53D43',
      border: '2px solid #C53D43',
      borderRadius: '2px',
      padding: '20px 24px',
      margin: '16px 28px',
      fontWeight: 700,
      textAlign: 'center' as const,
      boxShadow: '4px 4px 0 #E8DDD0',
    },
    footerStyle: {
      backgroundColor: '#2E2218',
      color: '#D4C5B2',
      padding: '20px 28px',
      textAlign: 'center' as const,
      fontSize: '12px',
      borderTop: '4px double #B8860B',
    },
  },

  // 4. エレガント — 高級感・上品
  {
    id: 'elegant',
    name: 'エレガント',
    description: '高級感と上品さを演出するデザイン',
    colors: {
      primary: '#1B2A4A',
      secondary: '#C9A84C',
      accent: '#8B6914',
      bg: '#F9F7F3',
      text: '#1B2A4A',
      subText: '#6B7A90',
    },
    headerStyle: {
      backgroundColor: '#1B2A4A',
      color: '#F9F7F3',
      fontWeight: 600,
      padding: '40px 32px',
      textAlign: 'center' as const,
      borderBottom: '1px solid #C9A84C',
      letterSpacing: '0.1em',
    },
    bodyStyle: {
      backgroundColor: '#F9F7F3',
      color: '#1B2A4A',
      padding: '32px',
      fontSize: '15px',
      lineHeight: 2.0,
      textAlign: 'center' as const,
    },
    couponStyle: {
      backgroundColor: '#FFFFFF',
      color: '#1B2A4A',
      border: '1px solid #C9A84C',
      borderRadius: '2px',
      padding: '24px',
      margin: '16px 32px',
      fontWeight: 600,
      textAlign: 'center' as const,
      boxShadow: '0 2px 12px rgba(27, 42, 74, 0.08)',
    },
    footerStyle: {
      backgroundColor: '#1B2A4A',
      color: '#C9A84C',
      padding: '20px 32px',
      textAlign: 'center' as const,
      fontSize: '12px',
      letterSpacing: '0.06em',
    },
  },

  // 5. カジュアル — 親しみやすい日常感
  {
    id: 'casual',
    name: 'カジュアル',
    description: '親しみやすくフレンドリーなデザイン',
    colors: {
      primary: '#4CAF50',
      secondary: '#42A5F5',
      accent: '#FF8A65',
      bg: '#F5F5EB',
      text: '#37474F',
      subText: '#78909C',
    },
    headerStyle: {
      background: 'linear-gradient(135deg, #4CAF50 0%, #42A5F5 100%)',
      color: '#FFFFFF',
      fontWeight: 800,
      borderRadius: '0 0 20px 20px',
      padding: '28px 24px',
      textAlign: 'center' as const,
      letterSpacing: '0.02em',
    },
    bodyStyle: {
      backgroundColor: '#F5F5EB',
      color: '#37474F',
      padding: '24px',
      fontSize: '15px',
      lineHeight: 1.8,
      textAlign: 'center' as const,
    },
    couponStyle: {
      backgroundColor: '#FFFFFF',
      color: '#37474F',
      borderRadius: '16px',
      padding: '20px 24px',
      margin: '16px',
      fontWeight: 700,
      textAlign: 'center' as const,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      border: '2px dashed #4CAF50',
    },
    footerStyle: {
      backgroundColor: '#37474F',
      color: '#E0E0E0',
      padding: '20px 24px',
      textAlign: 'center' as const,
      fontSize: '13px',
      borderRadius: '20px 20px 0 0',
    },
  },

  // 6. ナチュラル — 自然・オーガニック
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '自然の温もりを感じるオーガニックデザイン',
    colors: {
      primary: '#5B8C5A',
      secondary: '#8B6F47',
      accent: '#D4A574',
      bg: '#F7F3ED',
      text: '#3E3228',
      subText: '#8C7B6B',
    },
    headerStyle: {
      backgroundColor: '#5B8C5A',
      color: '#F7F3ED',
      fontWeight: 700,
      padding: '32px 28px',
      textAlign: 'center' as const,
      letterSpacing: '0.06em',
    },
    bodyStyle: {
      backgroundColor: '#F7F3ED',
      color: '#3E3228',
      padding: '28px',
      fontSize: '15px',
      lineHeight: 1.9,
      textAlign: 'center' as const,
    },
    couponStyle: {
      backgroundColor: '#FFFFFF',
      color: '#3E3228',
      border: '2px solid #D4A574',
      borderRadius: '12px',
      padding: '20px 24px',
      margin: '16px 28px',
      fontWeight: 600,
      textAlign: 'center' as const,
      boxShadow: '0 2px 8px rgba(91, 140, 90, 0.1)',
    },
    footerStyle: {
      backgroundColor: '#3E3228',
      color: '#D4C5B2',
      padding: '20px 28px',
      textAlign: 'center' as const,
      fontSize: '12px',
    },
  },
];

export type FlyerTasteId = (typeof FLYER_TASTES)[number]['id'];

export const getFlyerTaste = (id: string): FlyerTaste | undefined =>
  FLYER_TASTES.find((t) => t.id === id);

export const getFlyerSize = (id: string) =>
  FLYER_SIZES.find((s) => s.id === id);
