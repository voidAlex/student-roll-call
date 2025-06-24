// 动画效果管理工具
export class AnimationManager {
  private isEnabled: boolean = true

  // 设置动画开关
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  // 获取动画状态
  getEnabled(): boolean {
    return this.isEnabled
  }

  // 创建粒子效果
  createParticleEffect(element: HTMLElement, type: 'success' | 'error'): void {
    if (!this.isEnabled) return

    const particles = 12
    const colors = type === 'success' 
      ? ['#10b981', '#34d399', '#6ee7b7'] 
      : ['#ef4444', '#f87171', '#fca5a5']

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
      `

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      particle.style.left = centerX + 'px'
      particle.style.top = centerY + 'px'

      document.body.appendChild(particle)

      // 动画参数
      const angle = (Math.PI * 2 * i) / particles
      const velocity = 100 + Math.random() * 50
      const gravity = 300
      const life = 1000 + Math.random() * 500

      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const elapsed = currentTime - startTime
        const progress = elapsed / life

        if (progress >= 1) {
          particle.remove()
          return
        }

        const x = centerX + Math.cos(angle) * velocity * (elapsed / 1000)
        const y = centerY + Math.sin(angle) * velocity * (elapsed / 1000) + 
                  0.5 * gravity * Math.pow(elapsed / 1000, 2)

        particle.style.left = x + 'px'
        particle.style.top = y + 'px'
        particle.style.opacity = (1 - progress).toString()
        particle.style.transform = `scale(${1 - progress * 0.5})`

        requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }
  }

  // 创建脉冲效果
  createPulseEffect(element: HTMLElement): void {
    if (!this.isEnabled) return

    element.style.transform = 'scale(1.1)'
    element.style.transition = 'transform 0.2s ease'

    setTimeout(() => {
      element.style.transform = 'scale(1)'
    }, 200)
  }

  // 创建震动效果
  createShakeEffect(element: HTMLElement): void {
    if (!this.isEnabled) return

    const originalTransform = element.style.transform
    let shakeCount = 0
    const maxShakes = 6

    const shake = () => {
      if (shakeCount >= maxShakes) {
        element.style.transform = originalTransform
        return
      }

      const intensity = 5 - (shakeCount * 0.8)
      const x = (Math.random() - 0.5) * intensity
      const y = (Math.random() - 0.5) * intensity
      
      element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`
      shakeCount++
      
      setTimeout(shake, 50)
    }

    shake()
  }
}

// 创建全局动画管理器实例
export const animationManager = new AnimationManager()