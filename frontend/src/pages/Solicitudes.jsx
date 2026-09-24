import { useEffect, useState } from 'react'
import SolicitudResumen from '../components/SolicitudResumen'
import SolicitudTable from '../components/SolicitudTable'
import SolicitudForm from '../components/SolicitudForm'
import {
  cambiarEstado,
  crearSolicitud,
  obtenerResumen,
  obtenerSolicitudes,
} from '../services/solicitudService'

function Solicitudes() {
  const [resumen, setResumen] = useState({
    total: 0,
    pendientes: 0,
    en_proceso: 0,
    finalizadas: 0,
  })

  const [solicitudes, setSolicitudes] = useState([])

  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
  })

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorCarga, setErrorCarga] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setCargando(true)
      setError('')
      setErrorCarga(false)

      const [respuestaSolicitudes, respuestaResumen] =
        await Promise.all([
          obtenerSolicitudes(),
          obtenerResumen(),
        ])

      setSolicitudes(respuestaSolicitudes.data)
      setResumen(respuestaResumen.data)
    } catch (error) {
      setError(error.message)
      setErrorCarga(true)
    } finally {
      setCargando(false)
    }
  }

  function manejarCambioFiltro(event) {
    const { name, value } = event.target

    setFiltros((actuales) => ({
      ...actuales,
      [name]: value,
    }))
  }

  async function aplicarFiltros(event) {
    event.preventDefault()

    try {
      setCargando(true)
      setError('')

      const respuesta =
        await obtenerSolicitudes(filtros)

      setSolicitudes(respuesta.data)
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  async function crearNuevaSolicitud(datos) {
    await crearSolicitud(datos)

    const [respuestaSolicitudes, respuestaResumen] =
      await Promise.all([
        obtenerSolicitudes(filtros),
        obtenerResumen(),
      ])

    setSolicitudes(respuestaSolicitudes.data)
    setResumen(respuestaResumen.data)
  }

  async function actualizarEstadoSolicitud(
    id,
    nuevoEstado
  ) {
    try {
      setError('')

      await cambiarEstado(id, nuevoEstado)

      const [respuestaSolicitudes, respuestaResumen] =
        await Promise.all([
          obtenerSolicitudes(filtros),
          obtenerResumen(),
        ])

      setSolicitudes(respuestaSolicitudes.data)
      setResumen(respuestaResumen.data)
    } catch (error) {
      setError(error.message)
    }
  }

  async function limpiarFiltros() {
    const filtrosVacios = {
      estado: '',
      prioridad: '',
    }

    setFiltros(filtrosVacios)

    try {
      setCargando(true)
      setError('')

      const respuesta =
        await obtenerSolicitudes(filtrosVacios)

      setSolicitudes(respuesta.data)
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="app-container">
      <header className="page-header">
        <div>
          <h1>Solicitudes de soporte</h1>

          <p>
            Gestión y seguimiento de requerimientos registrados.
          </p>
        </div>
      </header>

      {cargando ? (
        <div className="loading">
          Cargando información...
        </div>
      ) : errorCarga ? (
        <section className="api-error-panel">
          <h2>API no disponible</h2>

          <p>
            No se pudo cargar la información de las solicitudes.
          </p>

          <button
            className="btn btn-primary"
            type="button"
            onClick={cargarDatos}
          >
            Reintentar
          </button>
        </section>
      ) : (
        <>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <SolicitudResumen
            resumen={resumen}
          />

          <div className="management-grid">
            <SolicitudForm
              onCrear={crearNuevaSolicitud}
            />

            <section className="panel filters-panel">
              <div className="panel-header">
                <div>
                  <h2>Filtros</h2>

                  <p>
                    Consulte solicitudes por estado y prioridad.
                  </p>
                </div>
              </div>

              <form onSubmit={aplicarFiltros}>
                <div className="filter-fields">
                  <div className="form-group">
                    <label htmlFor="estado">
                      Estado
                    </label>

                    <select
                      className="form-control"
                      id="estado"
                      name="estado"
                      value={filtros.estado}
                      onChange={manejarCambioFiltro}
                    >
                      <option value="">
                        Todos
                      </option>

                      <option value="PENDIENTE">
                        Pendiente
                      </option>

                      <option value="EN_PROCESO">
                        En proceso
                      </option>

                      <option value="FINALIZADA">
                        Finalizada
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prioridadFiltro">
                      Prioridad
                    </label>

                    <select
                      className="form-control"
                      id="prioridadFiltro"
                      name="prioridad"
                      value={filtros.prioridad}
                      onChange={manejarCambioFiltro}
                    >
                      <option value="">
                        Todas
                      </option>

                      <option value="BAJA">
                        Baja
                      </option>

                      <option value="MEDIA">
                        Media
                      </option>

                      <option value="ALTA">
                        Alta
                      </option>
                    </select>
                  </div>
                </div>

                <div className="filter-actions">
                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    Filtrar
                  </button>

                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={limpiarFiltros}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </section>
          </div>

          <SolicitudTable
            solicitudes={solicitudes}
            onCambiarEstado={
              actualizarEstadoSolicitud
            }
          />
        </>
      )}
    </main>
  )
}

export default Solicitudes