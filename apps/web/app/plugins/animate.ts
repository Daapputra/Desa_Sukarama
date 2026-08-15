export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('animate', {
    mounted(el, binding) {
      el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out')

      const delay = binding.value?.delay || 0
      if (delay) {
        el.style.transitionDelay = `${delay}ms`
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.remove('opacity-0', 'translate-y-8')
              el.classList.add('opacity-100', 'translate-y-0')
              observer.unobserve(el)
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        },
      )

      observer.observe(el)
    },
  })
})
