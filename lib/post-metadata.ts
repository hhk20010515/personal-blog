const textFields = [
  'camera',
  'lens',
  'focalLength',
  'aperture',
  'shutterSpeed',
  'locationName',
  'photoSeries',
] as const

const gearTextFields = [
  'gearBrand',
  'gearModel',
  'gearType',
  'sensorFormat',
  'dynamicRange',
  'autofocusSystem',
  'stabilization',
  'sampleVariation',
  'firmwareVersion',
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

function cleanFloat(value: unknown, min?: number, max?: number) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  if (min !== undefined && number < min) return null
  if (max !== undefined && number > max) return null
  return number
}

function cleanBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  }
  return null
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

export function buildGearCreateData(body: Record<string, unknown>) {
  return {
    gearBrand: cleanText(body.gearBrand),
    gearModel: cleanText(body.gearModel),
    gearType: cleanText(body.gearType),
    sensorFormat: cleanText(body.sensorFormat),
    megapixels: cleanFloat(body.megapixels, 0),
    weightGrams: cleanInteger(body.weightGrams),
    priceCny: cleanInteger(body.priceCny),
    reviewRating: cleanFloat(body.reviewRating, 0, 10),
    dynamicRange: cleanText(body.dynamicRange),
    autofocusSystem: cleanText(body.autofocusSystem),
    stabilization: cleanText(body.stabilization),
    weatherSealed: cleanBoolean(body.weatherSealed),
    sampleVariation: cleanText(body.sampleVariation),
    firmwareVersion: cleanText(body.firmwareVersion),
  }
}

export function buildGearUpdateData(body: Record<string, unknown>) {
  const data: Record<string, string | number | boolean | null | undefined> = {}

  gearTextFields.forEach((field) => {
    if (hasOwn(body, field)) {
      data[field] = cleanText(body[field])
    }
  })

  if (hasOwn(body, 'megapixels')) data.megapixels = cleanFloat(body.megapixels, 0)
  if (hasOwn(body, 'weightGrams')) data.weightGrams = cleanInteger(body.weightGrams)
  if (hasOwn(body, 'priceCny')) data.priceCny = cleanInteger(body.priceCny)
  if (hasOwn(body, 'reviewRating')) data.reviewRating = cleanFloat(body.reviewRating, 0, 10)
  if (hasOwn(body, 'weatherSealed')) data.weatherSealed = cleanBoolean(body.weatherSealed)

  return data
}
