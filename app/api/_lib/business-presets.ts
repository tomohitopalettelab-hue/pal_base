export type BusinessPreset = {
  type: string;
  label: string;
  icon: string;
  hooks: string[];
  exampleCoupons: string[];
  seasonalTips: Record<string, string>;
  avoidPatterns: string[];
};

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    type: 'restaurant',
    label: '飲食店',
    icon: 'UtensilsCrossed',
    hooks: [
      '限定性（本日限定・先着○名）',
      '損失回避（今日逃したら次はいつ？）',
      '社会的証明（月間○食突破の人気メニュー）',
      '返報性（店長からのお礼）',
      '天候連動（雨の日限定サービス）',
    ],
    exampleCoupons: [
      '雨の日限定・おつまみ1品無料',
      '【今日だけ】店長が仕入れすぎた○○を還元！',
      '平日ランチ限定・ドリンク1杯サービス',
      '来店3回目のお客様だけの裏メニュー解禁',
      'お誕生月の方にデザートプレートプレゼント',
    ],
    seasonalTips: {
      spring: '歓送迎会・お花見シーズン。宴会コースや持ち帰りセットが効果的',
      summer: '暑さ対策メニュー、ビアガーデン、冷製メニューをプッシュ',
      autumn: '食欲の秋。旬の食材フェアや収穫祭テーマが刺さる',
      winter: '忘新年会・クリスマス。温かいメニューや鍋フェアが人気',
    },
    avoidPatterns: ['単なる○%OFF', '条件が複雑すぎるクーポン', '利益を圧迫する過度な値引き'],
  },
  {
    type: 'beauty',
    label: '美容室・サロン',
    icon: 'Scissors',
    hooks: [
      '時間帯限定（平日14時までの隙間時間クーポン）',
      '初回体験（まずは試してほしいから特別価格）',
      'ビフォーアフター訴求（変わった自分に会える）',
      '紹介特典（お友達と一緒にキレイに）',
      '季節の髪悩み解決',
    ],
    exampleCoupons: [
      '平日14時までの隙間時間クーポン・カット20%OFF',
      '梅雨前の縮毛矯正キャンペーン',
      '初めての方限定・カット+カラー ¥○,○○○',
      'お友達紹介で次回施術¥1,000OFF',
      'トリートメントお試し体験 半額',
    ],
    seasonalTips: {
      spring: '新生活スタート。イメチェン需要、入学式・入社式前の来店を狙う',
      summer: 'ヘッドスパ・UV対策トリートメント。汗対策のショートスタイル提案',
      autumn: '秋カラー・パーマシーズン。乾燥対策トリートメントも',
      winter: 'クリスマス・年末年始の華やかスタイル。成人式対応',
    },
    avoidPatterns: ['技術の安売り感', '高頻度の値引き（ブランド毀損）', '既存客が不公平に感じる新規限定'],
  },
  {
    type: 'construction',
    label: '建設・リフォーム',
    icon: 'Hammer',
    hooks: [
      '季節の困りごと解決（梅雨前の屋根点検）',
      '無料診断・見積もり（まずは知ることから）',
      '施工事例の数字訴求（○○件の実績）',
      '補助金・助成金情報',
      '期間限定パッケージ価格',
    ],
    exampleCoupons: [
      '梅雨前の無料屋根点検キャンペーン',
      'リフォーム相談会・来場でQUOカードプレゼント',
      '外壁塗装 今なら足場代無料',
      '耐震診断 無料実施中',
      '水回りリフォームパック 特別価格',
    ],
    seasonalTips: {
      spring: '新年度の住まい見直し。外構・ガーデニングシーズン',
      summer: 'エアコン効率アップの断熱リフォーム。台風前の補修',
      autumn: '冬前の暖房設備・断熱工事。外壁塗装の好シーズン',
      winter: '水道管凍結対策。年末年始の大掃除ついでのリフォーム相談',
    },
    avoidPatterns: ['安さだけのアピール（品質不安）', '専門用語の多用', '押し売り感のある表現'],
  },
  {
    type: 'realestate',
    label: '不動産',
    icon: 'Building2',
    hooks: [
      '地域密着情報（この街の魅力を知り尽くした私たちだから）',
      '限定物件情報（ネット未掲載）',
      '相談会・セミナー（知識を得てから決める安心感）',
      '成約特典（引越し費用サポート）',
      'ライフステージ訴求（新婚・子育て・シニア）',
    ],
    exampleCoupons: [
      '来店相談でAmazonギフト券プレゼント',
      '成約特典・引越し費用○万円サポート',
      '住宅ローン無料相談会 開催中',
      '初めてのマイホーム講座 参加無料',
      '賃貸 仲介手数料半額キャンペーン',
    ],
    seasonalTips: {
      spring: '新生活シーズン。単身者・新社会人向け。転勤需要',
      summer: '秋の引越しに向けた早期相談。お盆休みの内覧会',
      autumn: '年内入居に間に合う物件。投資物件の節税相談',
      winter: '春の新生活準備。年度末の駆け込み需要',
    },
    avoidPatterns: ['過度な煽り（即決を迫る）', '重要事項の隠蔽感', '非現実的な利回り表示'],
  },
  {
    type: 'retail',
    label: '小売・物販',
    icon: 'ShoppingBag',
    hooks: [
      'タイムセール（あと○時間）',
      'まとめ買い特典（2点目から○%OFF）',
      '会員限定先行販売',
      'SNSフォロー特典',
      '季節イベント連動',
    ],
    exampleCoupons: [
      'LINE友だち追加で10%OFFクーポン',
      '週末限定タイムセール 最大30%OFF',
      'お買い上げ¥○,○○○以上で送料無料',
      'スタンプ2倍デー開催',
      '季節の新商品 先行お試し価格',
    ],
    seasonalTips: {
      spring: '新生活応援セール。母の日ギフト。ゴールデンウィーク',
      summer: 'サマーセール。お中元。夏休みイベント',
      autumn: '秋の新作。ハロウィン。早割クリスマス',
      winter: '年末セール・福袋。バレンタイン。ホワイトデー',
    },
    avoidPatterns: ['常時セール（信頼性低下）', '二重価格表示', '在庫処分感が強すぎる表現'],
  },
  {
    type: 'medical',
    label: '医療・クリニック',
    icon: 'Heart',
    hooks: [
      '季節の健康課題（花粉症・インフルエンザ）',
      '検診・健康チェック訴求',
      '待ち時間短縮・予約システム',
      'Web問診の便利さ',
      '専門性・実績のアピール',
    ],
    exampleCoupons: [
      '初診Web予約で待ち時間ゼロ',
      '健康診断キャンペーン実施中',
      'LINEで簡単予約・リマインド通知',
      '花粉症対策 早期受診キャンペーン',
      'オンライン診療 始めました',
    ],
    seasonalTips: {
      spring: '花粉症対策。新年度の健康診断',
      summer: '熱中症対策。夏バテ相談',
      autumn: 'インフルエンザ予防接種。健康診断シーズン',
      winter: '風邪・感染症対策。乾燥肌ケア',
    },
    avoidPatterns: ['過度な値引き（医療の質への不安）', '効果の誇大表現', '景品表示法違反'],
  },
];

export const getSeasonKey = (): string => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

export const getPresetByType = (type: string): BusinessPreset | undefined => {
  return BUSINESS_PRESETS.find((p) => p.type === type);
};
