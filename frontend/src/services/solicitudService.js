const API_URL = '/api/solicitudes'
const AUTH_TOKEN = '100-token'

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${AUTH_TOKEN}`,
}

async function obtenerContenidoRespuesta(response) {
  const contenido = await response.text()

  if (!contenido) {
    return {}
  }

  try {
    return JSON.parse(contenido)
  } catch {
    return {}
  }
}

async function realizarPeticion(url, opciones = {}) {
  try {
    const response = await fetch(url, opciones)
    const data = await obtenerContenidoRespuesta(response)

    if (!response.ok) {
      let mensaje =
        data.message ||
        'Ocurrió un error al procesar la solicitud.'

      if (
        response.status >= 500 &&
        !data.message
      ) {
        mensaje = 'API NO DISPONIBLE.'
      }

      const error = new Error(mensaje)

      error.status = response.status
      error.errors = data.errors || {}

      throw error
    }

    return data
  } catch (error) {
    if (error.status) {
      throw error
    }

    throw new Error(
      'API NO DISPONIBLE.',
      { cause: error }
    )
  }
}

export async function obtenerSolicitudes(filtros = {}) {
  const params = new URLSearchParams()

  if (filtros.estado) {
    params.append('estado', filtros.estado)
  }

  if (filtros.prioridad) {
    params.append('prioridad', filtros.prioridad)
  }

  const query = params.toString()
  const url = query
    ? `${API_URL}?${query}`
    : API_URL

  return realizarPeticion(url)
}

export async function obtenerResumen() {
  return realizarPeticion(
    `${API_URL}/resumen`
  )
}

export async function crearSolicitud(solicitud) {
  return realizarPeticion(API_URL, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify(solicitud),
  })
}

export async function cambiarEstado(id, estado) {
  return realizarPeticion(
    `${API_URL}/${id}/estado`,
    {
      method: 'PUT',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        estado,
      }),
    }
  )
}