// emoji头像管理工具

// 可选的emoji头像列表
export const AVATAR_EMOJIS = [
  // 人物表情
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  
  // 动物
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
  '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂',
  
  // 食物
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
  '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶️',
  '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨',
  
  // 物品
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
  '🎯', '🏹', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎲', '🎮',
  
  // 自然
  '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌾', '🌿', '🍀', '🍃',
  '🌳', '🌲', '🌴', '🌵', '🌶️', '🍄', '🌰', '🌊', '💧', '🔥',
  '⭐', '🌟', '💫', '✨', '☀️', '🌙', '🌈', '☁️', '⛅', '🌤️'
]

// 根据性别获取默认emoji（如果没有选择头像）
export function getDefaultEmojiByGender(gender: '男' | '女'): string {
  return gender === '女' ? '👩' : '👨'
}

// 随机生成一个emoji头像
export function generateRandomEmoji(): string {
  const randomIndex = Math.floor(Math.random() * AVATAR_EMOJIS.length)
  return AVATAR_EMOJIS[randomIndex]
}

// 检查是否为有效的emoji头像
export function isValidEmoji(emoji: string): boolean {
  return AVATAR_EMOJIS.includes(emoji) || emoji === '👩' || emoji === '👨'
}

// 按类别分组emoji
export const EMOJI_CATEGORIES = {
  people: {
    name: '人物表情',
    emojis: AVATAR_EMOJIS.slice(0, 30)
  },
  animals: {
    name: '动物',
    emojis: AVATAR_EMOJIS.slice(30, 60)
  },
  food: {
    name: '食物',
    emojis: AVATAR_EMOJIS.slice(60, 90)
  },
  objects: {
    name: '物品',
    emojis: AVATAR_EMOJIS.slice(90, 120)
  },
  nature: {
    name: '自然',
    emojis: AVATAR_EMOJIS.slice(120)
  }
}