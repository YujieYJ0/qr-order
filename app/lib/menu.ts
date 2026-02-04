export type CategoryKey = "western" | "chinese" | "coffee" | "drink" | "snack";

export type MenuItem = {
  id: string;
  cat: CategoryKey;
  name: string;
  price: number;
  sold?: number;
  desc?: string;
  img?: string;
  calories?: number;
  rating?: number;
  time?: string;
  ingredients?: string[];
};

export const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "western", label: "西式面包", icon: "🍞" },
  { key: "chinese", label: "中式面点", icon: "🥟" },
  { key: "coffee", label: "咖啡", icon: "☕️" },
  { key: "drink", label: "营养饮品", icon: "🥛" },
  { key: "snack", label: "元气糕点", icon: "🍩" },
];

export const MENU: MenuItem[] = [
  {
    id: "1",
    cat: "chinese",
    name: "元气油条",
    price: 420,
    sold: 38,
    desc: "外酥里软",
    img: "/images/youtiao.jpg",
    calories: 190,
    rating: 4.6,
    time: "15-20 分钟",
    ingredients: ["猪肉馅", "面粉", "小葱"],
  },
  {
    id: "2",
    cat: "chinese",
    name: "小笼包",
    price: 520,
    sold: 12,
    desc: "一口爆汁",
    img: "/images/xiaolongbao.jpg",
    calories: 230,
    rating: 4.7,
    time: "12-18 分钟",
    ingredients: ["鲜肉", "面粉", "姜"],
  },
  {
    id: "3",
    cat: "western",
    name: "牛角包",
    price: 360,
    sold: 25,
    desc: "黄油香",
    img: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80&auto=format&fit=crop",
    calories: 280,
    rating: 4.5,
    time: "8-12 分钟",
    ingredients: ["黄油", "面粉", "牛奶"],
  },
  {
    id: "4",
    cat: "coffee",
    name: "拿铁",
    price: 480,
    sold: 19,
    desc: "奶香顺滑",
    img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop",
    calories: 160,
    rating: 4.4,
    time: "5-8 分钟",
    ingredients: ["咖啡", "牛奶"],
  },
  {
    id: "5",
    cat: "drink",
    name: "鲜奶",
    price: 280,
    sold: 9,
    desc: "冰镇更好喝",
    img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80&auto=format&fit=crop",
    calories: 120,
    rating: 4.3,
    time: "3-5 分钟",
    ingredients: ["鲜牛奶"],
  },
  {
    id: "6",
    cat: "snack",
    name: "甜甜圈",
    price: 330,
    sold: 14,
    desc: "元气补给",
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80&auto=format&fit=crop",
    calories: 260,
    rating: 4.2,
    time: "8-10 分钟",
    ingredients: ["面粉", "糖霜"],
  },
];

export function formatJPY(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}
