<script>
  import { onMount, createEventDispatcher } from 'svelte'
  import { mapsLoaded, mapsLoading } from '@stores'

  const dispatch = createEventDispatcher()
  export let apiKey
  export let region = 'ID'

  function loader(
    url,
    test,
    callback,
    options = { async: true, defer: true },
  ) {
    if (!test()) {
      const tag = document.createElement('script')
      tag.src = url
      tag.async = options.async
      tag.defer = options.defer
      tag.onload = callback
      document.body.appendChild(tag)
    } else {
      callback()
    }
  }

  onMount(() => {
    window.byGmapsReady = () => {
      mapsLoaded.set(true)
      delete window['byGmapsReady']
    }

    if ($mapsLoaded) {
      dispatch('ready')
    }

    if (!$mapsLoading) {
      const url = [
        '//maps.googleapis.com/maps/api/js?',
        apiKey ? `key=${apiKey}&` : '',
        `libraries=places&region=${region}&language=id&callback=byGmapsReady`,
      ].join('')
      mapsLoading.set(true)
      loader(
        url,
        () => {
          return $mapsLoaded
        },
        () => {
          dispatch('ready')
        },
      )
    }
  })
</script>
