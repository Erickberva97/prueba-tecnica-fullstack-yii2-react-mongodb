function SolicitudResumen({ resumen }) {
  return (
    <section className="resumen-section">
      <div className="resumen-grid">
        <div className="resumen-card total">
          <span className="resumen-label">
            Total
          </span>

          <strong className="resumen-value">
            {resumen.total}
          </strong>
        </div>

        <div className="resumen-card pendientes">
          <span className="resumen-label">
            Pendientes
          </span>

          <strong className="resumen-value">
            {resumen.pendientes}
          </strong>
        </div>

        <div className="resumen-card proceso">
          <span className="resumen-label">
            En proceso
          </span>

          <strong className="resumen-value">
            {resumen.en_proceso}
          </strong>
        </div>

        <div className="resumen-card finalizadas">
          <span className="resumen-label">
            Finalizadas
          </span>

          <strong className="resumen-value">
            {resumen.finalizadas}
          </strong>
        </div>
      </div>
    </section>
  )
}

export default SolicitudResumen