// Fisher-Yates洗牌算法
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 随机选择指定数量的元素
export function randomPick<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return shuffleArray(array)
  }
  
  const shuffled = shuffleArray(array)
  return shuffled.slice(0, count)
}

// 权重随机选择（可选功能）
export function weightedRandomPick<T>(
  items: T[], 
  weights: number[], 
  count: number = 1
): T[] {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length')
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const selected: T[] = []
  const availableItems = [...items]
  const availableWeights = [...weights]
  
  for (let i = 0; i < count && availableItems.length > 0; i++) {
    const random = Math.random() * availableWeights.reduce((sum, w) => sum + w, 0)
    let currentWeight = 0
    
    for (let j = 0; j < availableItems.length; j++) {
      currentWeight += availableWeights[j]
      if (random <= currentWeight) {
        selected.push(availableItems[j])
        availableItems.splice(j, 1)
        availableWeights.splice(j, 1)
        break
      }
    }
  }
  
  return selected
}

// 避免短期内重复的随机选择
export class AntiRepeatRandomPicker<T> {
  private recentPicks: T[] = []
  private maxRecentCount: number
  
  constructor(maxRecentCount: number = 3) {
    this.maxRecentCount = maxRecentCount
  }
  
  pick(items: T[], count: number = 1): T[] {
    const availableItems = items.filter(item => !this.recentPicks.includes(item))
    
    let selectedItems: T[]
    if (availableItems.length >= count) {
      selectedItems = randomPick(availableItems, count)
    } else {
      // 如果可用项目不足，从所有项目中选择
      selectedItems = randomPick(items, count)
    }
    
    // 更新最近选择记录
    this.recentPicks.push(...selectedItems)
    if (this.recentPicks.length > this.maxRecentCount) {
      this.recentPicks = this.recentPicks.slice(-this.maxRecentCount)
    }
    
    return selectedItems
  }
  
  reset(): void {
    this.recentPicks = []
  }
}