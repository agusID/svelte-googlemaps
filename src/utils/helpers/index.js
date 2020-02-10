export function mixcls(mix) {
  let k
  let y
  let str = ''
  if (mix) {
    if (typeof mix === 'object') {
      if (!!mix.push) {
        for (k = 0; k < mix.length; k++) {
          if (mix[k] && (y = mixcls(mix[k]))) {
            str && (str += ' ')
            str += y
          }
        }
      } else for (k in mix) if (mix[k] && (y = mixcls(k))) str += y
    } else if (typeof mix !== 'boolean' && !mix.call) str += mix
  }
  return str
}

export function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}

export function clean($$props) {
  // TODO support keys
  // eslint-disable-next-line no-unused-vars
  const { children, $$scope, $$slots } = $$props
  const rest = {}
  for (const key of Object.keys($$props)) {
    if (
      key !== 'children' &&
      key !== '$$scope' &&
      key !== '$$slots'
    ) {
      rest[key] = $$props[key]
    }
  }
  return rest
}

export const scrollToTop = () => {
  const c =
    document.documentElement.scrollTop || document.body.scrollTop
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop)
    window.scrollTo(0, c - c / 8)
  }
}
