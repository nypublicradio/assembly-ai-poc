import format from 'date-fns/format'

// format ISO timestamp to return only the time
export function formatTime(date: any) {
  if (date) {
    const dateObject = new Date(date)
    return format(dateObject, 'h:mm a')
  }
  return null
}

// format timestamp to hours, minutes and seconds
export function toMinutesAndSeconds( timestamp: any ) {
  const dateObject = new Date(timestamp)
  const hours = dateObject.getHours()
  const hoursIn12HourFormat = hours % 12 || 12
  const minutes = dateObject.getMinutes()
  const seconds = dateObject.getSeconds()
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')
  return `${hoursIn12HourFormat}:${paddedMinutes}:${paddedSeconds}`
}