<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import axios from 'axios'
  import GoogleSdk from './GoogleSdk'
  import { Input, Button, Loader, Flex } from '@components'

  export let apiKey
  export let value = null
  export let center = { lat: 0, lng: 0 }
  export let editable = false
  export let withFilter = false
  export let title = 'Pin Your Location'
  export let address = null
  
  export let mapOptions = {
    zoom: 17,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: false,
    scrollwheel: false,
    clickableIcons: false
  }
  
  // autocomplete
  export let ariaLabel = 'location'
  export let placeholder = 'Search your Location'
  export let viewValue = null
  export let filterOptions = {
    types: ['establishment'],
    fields: ['name', 'geometry', 'formatted_address']
  }

  const dispatch = createEventDispatcher()
  const iconSVG = 'icon-location-active.svg'
  
  let setLocation = false
  let markerVisible = false
  let container
  let map
  let marker
  let location
  let showMap = true
  let isGeolocation = true

  //autocomplete
  let search
  let autocomplete
  let currentPlace = ''
  let dropdown

  let zoom = 17

  export function getDomBounds() {
    return container.getBoundingClientRect()
  }

  export function getDefaultView() {
    return container.ownerDocument.defaultView
  }

  export function setHeight(height) {
    container.style.height = height
  }

  export function setMaxHeight(height) {
    container.style.maxHeight = height
  }

  export function getInternalMap() {
    return map
  }

  export function clear() {
    viewValue = null
    currentPlace = null
    dispatch('clear')
  }

  function dropdownVisible() {
    return document.querySelectorAll('.pac-container')[0].offsetParent !== null
  }

  function autocompleteKeydown(e) {
    if (e.keyCode == 13 && dropdownVisible())
      e.preventDefault()
  }

  function blur () {
    dispatch('blur')
    if (viewValue !== currentPlace)
      clear()
  }

  let google

  function initMarker(lat, lng) {
    const icon = {
      url: iconSVG,
      scaledSize: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(20.5, 41)
    }

    return new google.maps.Marker({
      position: { lat, lng },
      draggable: editable,
      animation: google.maps.Animation.DROP,
      map,
      title: 'Set Location',
      icon
    })
  }

  function initFilterPlace() {
    google = window['google']
    autocomplete = new google.maps.places.Autocomplete(
      search,
      filterOptions
    )

    autocomplete.addListener('place_changed', onPlaceChanged)
  }

  function onPlaceChanged() {
    if (search) {
      isGeolocation = true
      const place = autocomplete.getPlace()
      if (!place.geometry)
        return clear()

      value = {
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }

      viewValue = currentPlace = value.address
      center = { lat: value.lat, lng: value.lng }
      setLocation = true

      updateMap()
      dispatch('placeChanged', { place })
    }
  }

  async function getFormattedAddress(center, geocoder, map) {
    geocoder.geocode({'location': center}, function(results, status) {
      if (status === 'OK') {
        currentPlace = results[0].formatted_address
        viewValue = currentPlace
    
        value = {
          address: currentPlace,
          lat: center.lat,
          lng: center.lng,
        }
      } else {
        console.log(`Geocoder failed due to: ${status}`)
      }
    })
  }

  function dragEnd() {
    map.setCenter(marker.position)

    const location = map.getCenter()
    const { lat, lng } = location
    let geocoder = new google.maps.Geocoder

    marker.setVisible(true)
    marker.setPosition(location)
    markerVisible = false
    center = { lat: lat(), lng: lng() }
    value.address = currentPlace
    getFormattedAddress(center, geocoder, map)
    setLocation = true
  }

  function mapDrag(e) {
    const location = map.getCenter()

    marker.setVisible(false)
    marker.setPosition(location)
    markerVisible = true
    setLocation = true
  }

  function zoomChanged() {
    setTimeout(() => {
      zoom = isNaN(map.getZoom()) ? zoom : map.getZoom()
    }, 50)
  }

  function dragEvents() {
    marker = initMarker(center.lat, center.lng)

    google.maps.event.addListener(marker, 'dragstart', function(e){
      setLocation = false
      markerVisible = true
    })

    if(editable) {
      google.maps.event.addListener(marker, 'dragend', dragEnd)
      google.maps.event.addListener(map, 'drag', mapDrag)
      google.maps.event.addListener(map, 'dragend', dragEnd)
    }
  }

  function updateMap() {
    google = window['google']

    setTimeout(() => {
      map = new google.maps.Map(container, {
        center,
        ...mapOptions
      })

      dragEvents()
    }, 1)
  }

  function initMap() {
    google = window['google']
    if (editable) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          setLocation = true
          center = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }

          initFilterPlace()
          setTimeout(() => {
            map = new google.maps.Map(container, {
              center,
              ...mapOptions
            })
            let geocoder = new google.maps.Geocoder
            getFormattedAddress(center, geocoder, map)
            dragEvents()

            document.getElementById('map').addEventListener('mousewheel', wheelEvent, true)
            google.maps.event.addListener(map, 'zoom_changed', zoomChanged)

            dispatch('ready')
          }, 1)
        }, () => {
          isGeolocation = false
          initFilterPlace()
          setTimeout(() => {
            center = {
              lat: -6.1690974,
              lng: 106.73527
            }
            map = new google.maps.Map(container, {
              center,
              ...mapOptions
            })
            currentPlace = '-'
            dispatch('ready')
          }, 1)
        })
      } else {
        console.log('Geolocation is not supported by this browser.')
      }
    } else {
      setLocation = false
      setTimeout(() => {

        map = new google.maps.Map(container, {
          center,
          ...mapOptions
        })

        currentPlace = address
        
        marker = initMarker(center.lat, center.lng)

        document.getElementById('map').addEventListener('mousewheel', wheelEvent, true)
        google.maps.event.addListener(map, 'zoom_changed', zoomChanged)

        dispatch('ready')
      }, 1)
    }
  }

  function zoomHandler(zoomin) {
    map.setZoom(zoom += zoomin)
  }

  function wheelEvent(e) {
    zoomHandler(e.deltaY > 1 ? -0.1 : 0.1)
  }

  function handleClick() {
    dispatch('close')
  }

  function openMap() {
    const { lat, lng } = center
    if (ta
      (navigator.platform.indexOf('iPhone') != -1) || 
      (navigator.platform.indexOf('iPad') != -1) || 
      (navigator.platform.indexOf('iPod') != -1)
    )
      window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`)
    else 
      window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`)
  }

  function openLocationSetting() {
    document.location.href = 'chrome://settings/content/location'
  }
</script>

<style src="./style.sass">

</style>
<GoogleSdk {apiKey} on:ready={initMap} />
<div class="modal-container">
  <div class="modal-background" transition:fade on:click={handleClick} />
  <div class="modal">
    <svg on:click={handleClick} class="modal-close" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><g fill="none" fill-rule="evenodd"><path d="M0 0h20v20H0z"/><path stroke="#B6B6B6" stroke-linecap="round" stroke-width="2" d="M.25.25l19.5 19.5m0-19.5L.25 19.75"/></g></svg>
    <div class="modal-title">{title}</div>
    {#if withFilter}
      <div class="input-search-group">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path fill="#B6B6B6" d="M14.732 12.9h-.936l-.352-.349c2.693-3.142 2.342-7.914-.819-10.707-3.16-2.793-7.96-2.327-10.77.815-2.81 3.142-2.341 7.914.82 10.707 2.81 2.444 7.14 2.444 9.95 0l.351.35v.93l4.917 5.005c.468.465 1.288.465 1.756 0 .468-.466.468-1.28 0-1.746l-4.917-5.004zm-7.024 0c-2.926 0-5.268-2.327-5.268-5.237s2.342-5.237 5.268-5.237c2.927 0 5.268 2.328 5.268 5.237 0 2.91-2.341 5.238-5.268 5.238z"/></svg>
        <input class="input-search" aria-label={ariaLabel} {placeholder} bind:this={search} type="text" bind:value={viewValue} on:blur={blur} on:keydown={autocompleteKeydown} />
      </div>
      <p class="search-info">Please make sure your coordinate corresponds to your location.</p>
    {/if}
    <div class="map-container" id="map" transition:fade>
      <div class="map" transition:fade bind:this={container}></div>
      {#if setLocation}
        <span class="set-pickup-location" class:open-in-google={!editable} transition:fade on:click={handleClick}>
          Set Location
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><g fill="none" fill-rule="evenodd"><path fill="#fff" fill-rule="nonzero" d="M7.5 15.833a.833.833 0 01-.592-1.425L11.325 10 6.908 5.592a.837.837 0 011.184-1.184l5 5a.833.833 0 010 1.184l-5 5a.833.833 0 01-.592.241z"/><path d="M0 0h20v20H0z"/></g></svg>
          {#if markerVisible}
            <img class="marker-icon" src={iconSVG} alt="Set Location" />
          {/if}
        </span>
      {/if}
      {#if !isGeolocation}
        <div class="map-disabled" transition:fade>
          <div class="map-disabled-info">
            <div class="map-disabled--title">Allow App to access your location?</div>
            <p class="map-disabled--description">App needs your location to show you nearby event and for you to use select via map feature.</p>
            <Button on:click={openLocationSetting} color="primary" type="button" block rounded disabled>Allow</Button>
          </div>
        </div>
      {/if}
    </div>
    <div class="formatted-address">
      <img class="icon" src="icon-location-disabled.svg" alt="current place" />
      {#if currentPlace}
        {currentPlace}
      {:else}
        <Loader />
      {/if}
    </div>
    {#if !editable}
      <Flex alignItems="center" justifyContent="center">
        <Button on:click={openMap} color="primary" style="width: 320px; margin-top: 30px" rounded>
          Open in Google Map
        </Button>
      </Flex>
    {/if}
  </div>
</div>