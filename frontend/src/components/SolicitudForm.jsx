import { useState } from 'react'

const formularioInicial = {
  titulo: '',
  descripcion: '',
  prioridad: '',
}

function SolicitudForm({ onCrear }) {
  const [formulario, setFormulario] =
    useState(formularioInicial)

  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] =
    useState('')

  const [enviando, setEnviando] =
    useState(false)

  function manejarCambio(event) {
    const { name, value } = event.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))

    setErrores((actuales) => ({
      ...actuales,
      [name]: undefined,
    }))
  }

  function validarFormulario() {
    const nuevosErrores = {}

    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = [
        'El título es obligatorio.',
      ]
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = [
        'La descripción es obligatoria.',
      ]
    }

    if (!formulario.prioridad) {
      nuevosErrores.prioridad = [
        'La prioridad es obligatoria.',
      ]
    }

    return nuevosErrores
  }

  async function manejarEnvio(event) {
    event.preventDefault()

    const erroresFrontend =
      validarFormulario()

    if (
      Object.keys(erroresFrontend).length > 0
    ) {
      setErrores(erroresFrontend)
      return
    }

    try {
      setEnviando(true)
      setErrores({})
      setErrorGeneral('')

      await onCrear({
        titulo: formulario.titulo.trim(),
        descripcion:
          formulario.descripcion.trim(),
        prioridad: formulario.prioridad,
      })

      setFormulario(formularioInicial)
    } catch (error) {
      setErrorGeneral(error.message)
      setErrores(error.errors || {})
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h2>Nueva solicitud</h2>

          <p>
            Registre un nuevo requerimiento de soporte.
          </p>
        </div>
      </div>

      {errorGeneral && (
        <div className="alert alert-error">
          {errorGeneral}
        </div>
      )}

      <form
        onSubmit={manejarEnvio}
        noValidate
      >
        <div className="form-top-grid">
          <div className="form-group">
            <label htmlFor="titulo">
              Título
            </label>

            <input
              className="form-control"
              id="titulo"
              name="titulo"
              type="text"
              value={formulario.titulo}
              onChange={manejarCambio}
              placeholder="Ej. Error al generar reporte"
            />

            {errores.titulo?.map(
              (mensaje) => (
                <p
                  className="field-error"
                  key={mensaje}
                >
                  {mensaje}
                </p>
              )
            )}
          </div>

          <div className="form-group">
            <label htmlFor="prioridad">
              Prioridad
            </label>

            <select
              className="form-control"
              id="prioridad"
              name="prioridad"
              value={formulario.prioridad}
              onChange={manejarCambio}
            >
              <option value="">
                Seleccione una prioridad
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

            {errores.prioridad?.map(
              (mensaje) => (
                <p
                  className="field-error"
                  key={mensaje}
                >
                  {mensaje}
                </p>
              )
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">
            Descripción
          </label>

          <textarea
            className="form-control"
            id="descripcion"
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Describa el inconveniente o requerimiento"
          />

          {errores.descripcion?.map(
            (mensaje) => (
              <p
                className="field-error"
                key={mensaje}
              >
                {mensaje}
              </p>
            )
          )}
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={enviando}
          >
            {enviando
              ? 'Registrando...'
              : 'Registrar solicitud'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default SolicitudForm