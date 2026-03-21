export type RichMenuIconDef = {
  id: string;
  label: string;
  lucideIcon: string;
  defaultAction: string;
};

export const RICHMENU_ICONS: RichMenuIconDef[] = [
  { id: 'reservation', label: '予約', lucideIcon: 'CalendarCheck', defaultAction: 'url' },
  { id: 'menu', label: 'メニュー', lucideIcon: 'UtensilsCrossed', defaultAction: 'url' },
  { id: 'access', label: 'アクセス', lucideIcon: 'MapPin', defaultAction: 'url' },
  { id: 'coupon', label: 'クーポン', lucideIcon: 'Ticket', defaultAction: 'url' },
  { id: 'phone', label: '電話', lucideIcon: 'Phone', defaultAction: 'tel' },
  { id: 'line', label: 'LINE', lucideIcon: 'MessageCircle', defaultAction: 'url' },
  { id: 'instagram', label: 'Instagram', lucideIcon: 'Instagram', defaultAction: 'url' },
  { id: 'website', label: 'ホームページ', lucideIcon: 'Globe', defaultAction: 'url' },
  { id: 'news', label: 'お知らせ', lucideIcon: 'Bell', defaultAction: 'url' },
  { id: 'staff', label: 'スタッフ', lucideIcon: 'Users', defaultAction: 'url' },
  { id: 'shop', label: '店舗情報', lucideIcon: 'Store', defaultAction: 'url' },
  { id: 'photo', label: 'ギャラリー', lucideIcon: 'Camera', defaultAction: 'url' },
  { id: 'gift', label: '特典', lucideIcon: 'Gift', defaultAction: 'url' },
  { id: 'heart', label: 'お気に入り', lucideIcon: 'Heart', defaultAction: 'url' },
  { id: 'question', label: 'よくある質問', lucideIcon: 'HelpCircle', defaultAction: 'url' },
  { id: 'mail', label: 'お問い合わせ', lucideIcon: 'Mail', defaultAction: 'url' },
];
