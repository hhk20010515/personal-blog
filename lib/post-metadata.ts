const textFields = [
  'camera',
  'lens',
  'focalLength',
  'aperture',
  'shutterSpeed',
  'locationName',
  'photoSeries',
] as const

function cleanText(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function cleanInteger(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return null
  return Math.round(number)
}

function cleanCoordinate(value: unknown, min: number, max: number) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) return null
  return number
}

function cleanDate(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function hasOwn(body: Record<string, unknown>, field: string) {
  return Object.prototype.hasOwnProperty.call(body, field)
}

export function buildPhotographyCreateData(body: Record<string, unknown>) {
  return {
    camera: cleanText(body.camera),
    lens: cleanText(body.lens),
    focalLength: cleanText(body.focalLength),
    aperture: cleanText(body.aperture),
    shutterSpeed: cleanText(body.shutterSpeed),
    iso: cleanInteger(body.iso),
    takenAt: cleanDate(body.takenAt),
    locationName: cleanText(body.locationName),
    locationLat: cleanCoordinate(body.locationLat, -90, 90),
    locationLng: cleanCoordinate(body.locationLng, -180, 180),
    photoSeries: cleanText(body.photoSeries),
  }
}

export function buildPhotographyUpdateData(body: Record<string, unknown>) {
  const data: Record<string, string | number | Date | null | undefined> = {}

  textFields.forEach((field) => {
    if (hasOwn(body, field)) {
      data[field] = cleanText(body[field])
    }
  })

  if (hasOwn(body, 'iso')) data.iso = cleanInteger(body.iso)
  if (hasOwn(body, 'takenAt')) data.takenAt = cleanDate(body.takenAt)
  if (hasOwn(body, 'locationLat')) data.locationLat = cleanCoordinate(body.locationLat, -90, 90)
  if (hasOwn(body, 'locationLng')) data.locationLng = cleanCoordinate(body.locationLng, -180, 180)

  return data
}
