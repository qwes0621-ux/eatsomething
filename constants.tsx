
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

export const ZODIAC_SIGNS = [
  '牡羊座', '金牛座', '雙子座', '巨蟹座', 
  '獅子座', '處女座', '天秤座', '天蠍座', 
  '射手座', '摩羯座', '水瓶座', '雙魚座'
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
  }
];
