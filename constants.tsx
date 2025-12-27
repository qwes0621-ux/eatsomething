
import { Category, Restaurant } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: '飯類', subItems: ['炒飯', '焞飯', '燴飯', '蓋飯', '咖哩飯'], description: '飽足感高、選擇多，適合午餐能量補給。', color: '#FF9999' },
  { id: '2', name: '麵類', subItems: ['炒麵', '拉麵', '義大利麵', '乾麵', '牛肉麵'], description: '熱騰騰又快速，適合忙碌的中午時光。', color: '#FFCC99' },
  { id: '3', name: '便當類', subItems: ['排骨便當', '雞腿便當', '魚排便當', '雙拼便當'], description: '經濟實惠、菜色均衡。', color: '#FFFF99' },
  { id: '4', name: '湯品/火鍋', subItems: ['小火鍋', '麻辣燙', '酸菜白肉鍋', '汆燙鍋'], description: '天冷暖胃首選。', color: '#CCFF99' },
  { id: '5', name: '速食/西式', subItems: ['漢堡', '炸雞', '披薩', '薯條', '熱狗堡'], description: '快速又滿足，最適合忙碌午餐。', color: '#99FF99' },
  { id: '6', name: '日式料理', subItems: ['壽司', '丼飯', '炸豬排', '燒肉'], description: '清爽、質感、美味。', color: '#99FFCC' },
  { id: '7', name: '韓式料理', subItems: ['石鍋拌飯', '泡菜鍋', '烤肉', '辣炒年糕'], description: '重口味愛好者首選。', color: '#99FFFF' },
  { id: '8', name: '中式小吃', subItems: ['滷肉飯', '蚵仔煎', '水餃', '炒米粉', '燒臘'], description: '最接地氣的台灣味。', color: '#99CCFF' },
  { id: '9', name: '輕食/健康', subItems: ['沙拉', '雞胸便當', '蔬菜捲', '蔬果碗'], description: '吃得清爽沒負擔。', color: '#9999FF' },
  { id: '10', name: '燒烤/滷味', subItems: ['燒烤', '鹽酥雞', '滷味拼盤', '串燒'], description: '鹹香夠味、夜市人氣首選。', color: '#CC99FF' }
];

// Mock restaurant data for demonstration
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: '豪邁炒飯王',
    categoryId: '1',
    rating: 4.5,
    priceLevel: 1,
    cpValue: 9,
    address: '台北市信義區忠孝東路五段123號',
    imageUrl: 'https://picsum.photos/seed/r1/400/300',
    reviews: [{ userName: '阿明', comment: '份量超大，CP值爆表！', rating: 5 }]
  },
  {
    id: 'r2',
    name: '銀座拉麵',
    categoryId: '2',
    rating: 4.8,
    priceLevel: 2,
    cpValue: 7,
    address: '台北市大安區復興南路一段88號',
    imageUrl: 'https://picsum.photos/seed/r2/400/300',
    reviews: [{ userName: '小美', comment: '湯頭濃郁，很有日本味。', rating: 5 }]
  },
  {
    id: 'r3',
    name: '佳家便當',
    categoryId: '3',
    rating: 4.2,
    priceLevel: 1,
    cpValue: 8,
    address: '新北市板橋區文化路二段45號',
    imageUrl: 'https://picsum.photos/seed/r3/400/300',
    reviews: [{ userName: '老張', comment: '排骨炸得很酥，配菜新鮮。', rating: 4 }]
  },
  {
    id: 'r4',
    name: '一番小火鍋',
    categoryId: '4',
    rating: 4.0,
    priceLevel: 2,
    cpValue: 7,
    address: '桃園市中壢區新生路210號',
    imageUrl: 'https://picsum.photos/seed/r4/400/300',
    reviews: [{ userName: '軒軒', comment: '肉片厚實，自助吧很豐富。', rating: 4 }]
  },
  {
    id: 'r5',
    name: '大胃王漢堡',
    categoryId: '5',
    rating: 4.3,
    priceLevel: 2,
    cpValue: 8,
    address: '台中市西區公益路二段150號',
    imageUrl: 'https://picsum.photos/seed/r5/400/300',
    reviews: [{ userName: '漢堡控', comment: '花生醬培根堡超好吃！', rating: 5 }]
  }
];
