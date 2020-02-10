<script>
  import { mixcls } from '@helpers'

  export let color = 'primary'
  export let type = 'default'

  $: classes = mixcls([
    'loader',
    `${type}-loader`,
  ])

  $: classsPath = mixcls([
    'path',
    `${color}-color`
  ])
</script>

<style src="./style.sass">

</style>

<div class={classes}>
  <svg class="circular" viewBox="25 25 50 50">
    <circle class={classsPath} cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
  </svg>
</div>
