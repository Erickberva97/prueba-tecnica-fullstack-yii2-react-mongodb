function SolicitudTable({
  solicitudes,
  onCambiarEstado,
}) {
  function formatearFecha(fecha) {
    if (!fecha) {
      return '-'
    }

    return new Date(fecha).toLocaleString(
      'es-EC'
    )
  }

  function formatearEstado(estado) {
    return estado.replace('_', ' ')
  }

  function obtenerAccion(estado) {
    if (estado === 'PENDIENTE') {
      return {
        texto: 'Marcar en proceso',
        siguienteEstado: 'EN_PROCESO',
      }
    }

    if (estado === 'EN_PROCESO') {
      return {
        texto: 'Marcar finalizada',
        siguienteEstado: 'FINALIZADA',
      }
    }

    return null
  }

  function obtenerClasePrioridad(prioridad) {
    return `prioridad-${prioridad.toLowerCase()}`
  }

  function obtenerClaseEstado(estado) {
    return `estado-${estado.toLowerCase()}`
  }

  return (
    <section className="panel table-panel">
      <div className="table-header">
        <div>
          <h2>Listado de solicitudes</h2>

          <p>
            Solicitudes registradas en el sistema.
          </p>
        </div>
      </div>

      {solicitudes.length === 0 ? (
        <div className="empty-state">
          No existen solicitudes registradas.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="solicitudes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {solicitudes.map((solicitud) => {
                const accion =
                  obtenerAccion(
                    solicitud.estado
                  )

                return (
                  <tr key={solicitud._id}>
                    <td className="id-cell">
                      {solicitud._id}
                    </td>

                    <td className="title-cell">
                      {solicitud.titulo}
                    </td>

                    <td>
                      <span
                        className={`badge ${obtenerClasePrioridad(
                          solicitud.prioridad
                        )}`}
                      >
                        {solicitud.prioridad}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${obtenerClaseEstado(
                          solicitud.estado
                        )}`}
                      >
                        {formatearEstado(
                          solicitud.estado
                        )}
                      </span>
                    </td>

                    <td className="date-cell">
                      {formatearFecha(
                        solicitud.fecha_creacion
                      )}
                    </td>

                    <td className="action-cell">
                      {accion ? (
                        <button
                          className="btn-action"
                          type="button"
                          onClick={() =>
                            onCambiarEstado(
                              solicitud._id,
                              accion.siguienteEstado
                            )
                          }
                        >
                          {accion.texto}
                        </button>
                      ) : (
                        <span className="no-action">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default SolicitudTable