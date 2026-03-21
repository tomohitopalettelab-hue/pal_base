export type BannerSize = {
  width: number;
  height: number;
  label: string;
  platform: string;
};

export const BANNER_SIZES: Record<string, BannerSize> = {
  square: { width: 1080, height: 1080, label: '正方形', platform: 'GBP投稿' },
  wide: { width: 1200, height: 628, label: '横長', platform: 'LINEリッチメッセージ' },
};

export type BannerTemplate = {
  id: string;
  name: string;
  description: string;
  layout: 'photo-full' | 'photo-left' | 'photo-top' | 'split';
  overlayPosition: 'bottom-band' | 'top-band' | 'center-overlay' | 'side-panel';
  overlayStyle: {
    background: string;
    textColor: string;
    opacity: number;
  };
};

export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'bold-bottom',
    name: 'ボールド・ボトム',
    description: '写真全面＋下部に太い帯',
    layout: 'photo-full',
    overlayPosition: 'bottom-band',
    overlayStyle: { background: '#8CC63F', textColor: '#FFFFFF', opacity: 0.92 },
  },
  {
    id: 'elegant-top',
    name: 'エレガント・トップ',
    description: '写真全面＋上部に細い帯',
    layout: 'photo-full',
    overlayPosition: 'top-band',
    overlayStyle: { background: '#333333', textColor: '#FFFFFF', opacity: 0.85 },
  },
  {
    id: 'center-focus',
    name: 'センターフォーカス',
    description: '写真全面＋中央にテキストボックス',
    layout: 'photo-full',
    overlayPosition: 'center-overlay',
    overlayStyle: { background: '#FFFFFF', textColor: '#333333', opacity: 0.9 },
  },
  {
    id: 'split-green',
    name: 'スプリット・グリーン',
    description: '左に写真、右にテキストパネル',
    layout: 'split',
    overlayPosition: 'side-panel',
    overlayStyle: { background: '#8CC63F', textColor: '#FFFFFF', opacity: 1 },
  },
  {
    id: 'dark-overlay',
    name: 'ダークオーバーレイ',
    description: '写真全面＋暗いオーバーレイ＋下部テキスト',
    layout: 'photo-full',
    overlayPosition: 'bottom-band',
    overlayStyle: { background: '#1a1a1a', textColor: '#FFFFFF', opacity: 0.75 },
  },
  {
    id: 'warm-center',
    name: 'ウォーム・センター',
    description: '写真全面＋暖色中央ボックス',
    layout: 'photo-full',
    overlayPosition: 'center-overlay',
    overlayStyle: { background: '#F39800', textColor: '#FFFFFF', opacity: 0.92 },
  },
];

export type ColorPalette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  text: string;
  background: string;
};

export const COLOR_PALETTES: ColorPalette[] = [
  { id: 'lime', name: 'ライム', primary: '#8CC63F', secondary: '#6B9E2E', text: '#FFFFFF', background: '#EBF5E0' },
  { id: 'orange', name: 'オレンジ', primary: '#F39800', secondary: '#D4840A', text: '#FFFFFF', background: '#FFF5E6' },
  { id: 'blue', name: 'ブルー', primary: '#2196F3', secondary: '#1976D2', text: '#FFFFFF', background: '#E3F2FD' },
  { id: 'red', name: 'レッド', primary: '#E53935', secondary: '#C62828', text: '#FFFFFF', background: '#FFEBEE' },
  { id: 'purple', name: 'パープル', primary: '#A62183', secondary: '#8a1a6d', text: '#FFFFFF', background: '#F5E6F0' },
  { id: 'dark', name: 'ダーク', primary: '#333333', secondary: '#1a1a1a', text: '#FFFFFF', background: '#F5F5F5' },
];
