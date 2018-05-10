const fnArray: any = []
const windowClone: any = window

const googleInterval = setInterval(() => {
  if (windowClone.google && windowClone.google.maps && windowClone._gmap) {
    fnArray.forEach((fn: (google: any, googlemaps: any) => any) =>
      fn(windowClone.google, windowClone._gmap),
    )
    clearInterval(googleInterval)
  }
}, 100)

const googleMapsLoadWhenReady = (fn: () => any) => {
  if (windowClone.google && windowClone.google.maps && windowClone._gmap) {
    fn()
  } else {
    fnArray.push(fn)
  }
}

export default googleMapsLoadWhenReady
