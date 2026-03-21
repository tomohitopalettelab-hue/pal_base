export type RichMenuArea = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type RichMenuLayout = {
  id: string;
  name: string;
  cols: number;
  rows: number;
  areas: RichMenuArea[];
  description: string;
};

export const RICHMENU_LAYOUTS: RichMenuLayout[] = [
  {
    id: '2x3',
    name: '2行3列',
    cols: 3,
    rows: 2,
    description: '定番の6ボタン構成',
    areas: [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 1, y: 0, w: 1, h: 1 },
      { x: 2, y: 0, w: 1, h: 1 },
      { x: 0, y: 1, w: 1, h: 1 },
      { x: 1, y: 1, w: 1, h: 1 },
      { x: 2, y: 1, w: 1, h: 1 },
    ],
  },
  {
    id: '1x3',
    name: '1行3列',
    cols: 3,
    rows: 1,
    description: 'シンプルな3ボタン',
    areas: [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 1, y: 0, w: 1, h: 1 },
      { x: 2, y: 0, w: 1, h: 1 },
    ],
  },
  {
    id: '2x2',
    name: '2行2列',
    cols: 2,
    rows: 2,
    description: '大きめの4ボタン',
    areas: [
      { x: 0, y: 0, w: 1, h: 1 },
      { x: 1, y: 0, w: 1, h: 1 },
      { x: 0, y: 1, w: 1, h: 1 },
      { x: 1, y: 1, w: 1, h: 1 },
    ],
  },
  {
    id: 'hero-2x2',
    name: 'ヒーロー＋2列',
    cols: 2,
    rows: 2,
    description: '上部大きく1つ＋下部に2つ',
    areas: [
      { x: 0, y: 0, w: 2, h: 1 },
      { x: 0, y: 1, w: 1, h: 1 },
      { x: 1, y: 1, w: 1, h: 1 },
    ],
  },
  {
    id: 'hero-3',
    name: 'ヒーロー＋3列',
    cols: 3,
    rows: 2,
    description: '上部大きく1つ＋下部に3つ',
    areas: [
      { x: 0, y: 0, w: 3, h: 1 },
      { x: 0, y: 1, w: 1, h: 1 },
      { x: 1, y: 1, w: 1, h: 1 },
      { x: 2, y: 1, w: 1, h: 1 },
    ],
  },
];
