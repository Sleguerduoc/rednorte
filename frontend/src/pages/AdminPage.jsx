import { useAdminPage }          from "../hooks/useAdminPage";
import SalaDelDia               from "../components/sala/SalaDelDia";
import ListaEsperaPendiente     from "../components/sala/ListaEsperaPendiente";
import PanelOfertas             from "../components/sala/PanelOfertas";
import WizardAgendamiento       from "../components/sala/WizardAgendamiento";

const TABS = [
  { key: "sala",    label: "Sala del día" },
  { key: "lista",   label: "Lista de espera" },
  { key: "ofertas", label: "Ofertas" },
];

export default function AdminPage() {
  const {
    tab, setTab,
    banner,
    // Sala
    fecha, setFecha,
    especialidad, setEspecialidad,
    citas, cargandoSala, cargandoAccion, cupoLiberado, setCupoLiberado,
    cargarSala, doCheckIn, doNoShow, doAtender,
    // Lista
    solicitudes, cargandoLista, cargarLista,
    // Ofertas
    ofertas, cargandoOfertas, cargarOfertas, doRevisarVencidas,
    // Wizard
    wizard, wizardStep,
    wizardFecha, setWizardFecha,
    wizardHora, setWizardHora,
    horasOcupadas, cargandoHoras, agendando,
    abrirWizard, cerrarWizard, avanzarWizard, doAgendar,
  } = useAdminPage();

  return (
    <>
      {/* Banner inline (success / error dentro de esta página) */}
      {banner && (
        <div
          className={`rn-alert rn-alert--${banner.tipo === "exito" ? "success" : "error"}`}
          style={{ marginBottom: 16 }}
        >
          {banner.texto}
        </div>
      )}

      <div className="rn-panel">
        {/* Sub-navegación */}
        <div className="rn-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`rn-tab${tab === key ? " rn-tab--active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sala del día */}
        {tab === "sala" && (
          <SalaDelDia
            fecha={fecha}               setFecha={setFecha}
            especialidad={especialidad} setEspecialidad={setEspecialidad}
            citas={citas}               cargando={cargandoSala}
            cargandoAccion={cargandoAccion}
            cupoLiberado={cupoLiberado} setCupoLiberado={setCupoLiberado}
            onCheckIn={doCheckIn}       onNoShow={doNoShow}
            onAtender={doAtender}       onActualizar={cargarSala}
            onVerOfertas={() => setTab("ofertas")}
          />
        )}

        {/* Lista de espera pendiente */}
        {tab === "lista" && (
          <ListaEsperaPendiente
            solicitudes={solicitudes}
            cargando={cargandoLista}
            onAgendar={abrirWizard}
            onActualizar={cargarLista}
          />
        )}

        {/* Ofertas */}
        {tab === "ofertas" && (
          <PanelOfertas
            ofertas={ofertas}
            cargando={cargandoOfertas}
            onRevisarVencidas={doRevisarVencidas}
            onActualizar={cargarOfertas}
          />
        )}
      </div>

      {/* Wizard (modal) */}
      {wizard && (
        <WizardAgendamiento
          solicitud={wizard.solicitud}
          step={wizardStep}
          wizardFecha={wizardFecha}   setWizardFecha={setWizardFecha}
          wizardHora={wizardHora}     setWizardHora={setWizardHora}
          horasOcupadas={horasOcupadas}
          cargandoHoras={cargandoHoras}
          agendando={agendando}
          onSiguiente={avanzarWizard}
          onAgendar={doAgendar}
          onCerrar={cerrarWizard}
        />
      )}
    </>
  );
}
