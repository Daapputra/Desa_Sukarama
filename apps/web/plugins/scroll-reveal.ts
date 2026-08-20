export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('scroll-reveal', {
    mounted(el: HTMLElement, binding: any) {
      if (typeof window === 'undefined') return;
      const type = binding.value?.type || 'up'
      let delay = binding.value?.delay || 0
      const stagger = binding.value?.stagger

      // Bouncy out easing
      const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

      // Setup initial states
      if (stagger) {
        Array.from(el.children).forEach((c: any, i) => {
          c.style.opacity = '0'
          c.style.transform = 'translateY(120px)'
          c.style.transition = `opacity 1.2s ease, transform 1.2s ${easing}`
          c.style.transitionDelay = `${delay + (i * 150)}ms`
        })
      } else {
        el.style.opacity = '0'
        el.style.transition = `opacity 1.2s ease, transform 1.2s ${easing}, filter 1s ease`
        el.style.filter = 'blur(8px)'
        if (delay) el.style.transitionDelay = `${delay}ms`

        switch (type) {
          case 'left': el.style.transform = 'translateX(-120px)'; break
          case 'right': el.style.transform = 'translateX(120px)'; break
          case 'zoom': el.style.transform = 'scale(0.85) translateY(40px)'; break
          default: el.style.transform = 'translateY(120px)'
        }
      }

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(() => {
            if (stagger) {
              Array.from(el.children).forEach((c: any) => {
                c.style.opacity = '1'
                c.style.transform = 'translate(0)'
              })
            } else {
              el.style.opacity = '1'
              el.style.transform = 'translate(0) scale(1)'
              el.style.filter = 'blur(0)'
            }
          })
          observer.unobserve(el)
        }
      }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' })
      
      setTimeout(() => {
        observer.observe(el)
      }, 50)
    },
    getSSRProps() {
      return {}
    }
  })
})
