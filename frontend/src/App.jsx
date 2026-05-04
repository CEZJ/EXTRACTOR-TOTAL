import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, Terminal, FileSpreadsheet, Activity, ChevronRight, Download, Cpu, Database, Zap } from 'lucide-react';

export default function App() {
  // --- ESTADOS DE LA LÓGICA ---
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const consoleEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- ESTADO: PANTALLA DE BIENVENIDA ---
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type, text) => {
    setLogs((prev) => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
  }; 

  const descargarExcels = () => {
    addLog('system', 'Iniciando descargas seguras...');
    
    // Descarga 1: Reporte
    const link1 = document.createElement('a');
    link1.href = "https://extractor-total-2.onrender.com/descargar-reporte";
    document.body.appendChild(link1);
    link1.click();
    document.body.removeChild(link1);

    // Esperamos 2 segundos para la Descarga 2: Trama
    setTimeout(() => {
        const link2 = document.createElement('a');
        link2.href = "https://extractor-total-2.onrender.com/descargar-trama";
        document.body.appendChild(link2);
        link2.click();
        document.body.removeChild(link2);
        addLog('success', 'Descargas completadas.');
    }, 2000); 
  };

  // ==========================================
  // LÓGICA MAESTRA: PROCESAMIENTO POR LOTES
  // ==========================================
  const procesarArchivos = async (archivosSeleccionados) => {
    if (!archivosSeleccionados || archivosSeleccionados.length === 0) return;
    
    setStatus('processing'); 
    setProgress(5); 
    setLogs([]); 
    setExtractedData([]);

    const archivosArray = Array.from(archivosSeleccionados); 
    const tamañoLote = 1; // Render procesará de 1 en 1
    let todosLosResultados = [];
    
    try {
        addLog('system', `INICIANDO INGESTA MASIVA. Total: ${archivosArray.length} archivo(s)...`);
        
        // 1. CICLO DE LOTES
        for (let i = 0; i < archivosArray.length; i += tamañoLote) {
            const lote = archivosArray.slice(i, i + tamañoLote);
            const formData = new FormData();
            
            lote.forEach(file => {
                formData.append("archivos", file);
                addLog('info', `[EN COLA] > ${file.name}`);
            });
            
            const numLote = Math.floor(i / tamañoLote) + 1;
            const totalLotes = Math.ceil(archivosArray.length / tamañoLote);
            
            addLog('system', `[ENVIANDO] Lote ${numLote} de ${totalLotes} al Motor Neural...`);

            // Enviamos lote actual
            const response = await fetch("https://extractor-total-2.onrender.com/procesar-pdfs/", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error(`El servidor rechazó el lote ${numLote}`);
            
            const data = await response.json();
            todosLosResultados.push(...data.datos); // Acumulamos los datos extraídos
            
            // Actualizamos la barra (llega máximo al 80% durante la lectura)
            const progresoActual = Math.round(((i + lote.length) / archivosArray.length) * 80);
            setProgress(progresoActual);
        }

        addLog('system', '[ENSAMBLANDO] Consolidando matriz maestra de datos...');
        setProgress(90);

        // 2. SOLICITUD FINAL: Generar los Excels con toda la data
        const resFinal = await fetch("https://extractor-total-2.onrender.com/generar-excels-finales/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resultados: todosLosResultados })
        });

        if (!resFinal.ok) throw new Error("Error al ensamblar los archivos finales.");

        addLog('success', '[STATUS: OK] Extracción Masiva 100% Finalizada.');
        addLog('success', `[GENERADO] > Reporte_Polizas.xlsx`);
        addLog('success', `[GENERADO] > trama_carga_masiva_FINAL.xlsx`);
        setProgress(100);
        
        // Mostramos la data en la tabla de la web
        setExtractedData(todosLosResultados.map((f, i) => ({
            id: i, file: f['Archivo'], poliza: f['Poliza_Contrato'], doc: f['Documento'], prima: `S/ ${f['Prima_Total']}`
        })));
        setStatus('success');

        // 3. DESCARGAMOS LOS ARCHIVOS
        descargarExcels(); 

    } catch (error) {
        addLog('warning', `[ERROR CRÍTICO] ${error.message}`);
        setStatus('error');
        setProgress(0);
    }
  };

  // ==========================================
  // VISTA 1: PANTALLA DE BIENVENIDA (SPLASH SCREEN)
  // ==========================================
  if (showSplash) {
    return (
      <div className="h-screen w-full bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden font-mono select-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse"></div>

        <div className="z-10 flex flex-col items-center">
          <Cpu className="w-20 h-20 text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-600 tracking-[0.2em] mb-4 text-center">
            BIENVENIDO A C.Z.A.R 
          </h1>
          <p className="text-cyan-500/70 tracking-[0.3em] text-sm md:text-base mb-12 uppercase text-center max-w-lg">
            Sistema Inteligente de Extracción de Datos
          </p>
          
          <button 
            onClick={() => setShowSplash(false)} 
            className="group relative px-8 py-4 bg-[#082f49]/50 border border-cyan-400/50 text-cyan-300 hover:text-white overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"
          >
            <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative flex items-center gap-2 font-bold tracking-[0.1em]">
              <Zap className="w-5 h-5 fill-cyan-400 group-hover:fill-white" />
              INICIAR SECUENCIA
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 2: INTERFAZ FUTURISTA PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-[#020617] text-cyan-50 font-mono p-4 md:p-6 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="fixed bottom-4 right-6 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 z-50">
        <span className="text-[10px] tracking-[0.2em] text-cyan-500/70 uppercase">ENG.SYSTEMS //</span>
        <div className="px-2 py-1 border border-cyan-500/40 bg-cyan-950/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
          <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse"></div>
          <span className="text-cyan-300 text-xs font-bold tracking-widest">CARLOS ENRIQUE ZEGARRA JURADO</span>
        </div>
      </div>

      <header className="max-w-7xl mx-auto mb-6 flex justify-between items-end border-b border-cyan-800/60 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#082f49]/80 p-3 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Database className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.15em] text-cyan-50 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"> C.Z.A.R  // CORE</h1>
            <p className="text-xs text-cyan-500 tracking-widest mt-1 uppercase">Módulo de Ingesta Documental</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs font-bold tracking-widest px-4 py-2 border border-cyan-800 bg-[#082f49]/30 text-cyan-400">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full opacity-75 ${status === 'processing' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex h-2 w-2 ${status === 'processing' ? 'bg-amber-500' : 'bg-cyan-500'}`}></span>
          </span>
          {status === 'processing' ? 'ANALIZANDO FLUJO' : 'SISTEMA EN LÍNEA'}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-10">
        
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`bg-[#030b17]/80 backdrop-blur-sm border ${status === 'processing' ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-cyan-800/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]'} p-6 relative`}>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500"></div>

            <h2 className="text-sm font-bold tracking-widest text-cyan-300 mb-6 flex items-center gap-2 uppercase">
              <UploadCloud className="w-4 h-4" /> PANEL DE INYECCIÓN
            </h2>
            
            {status === 'idle' && (
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="group border border-dashed border-cyan-700/50 hover:border-cyan-400 bg-[#082f49]/20 hover:bg-[#082f49]/40 p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                <Activity className="w-12 h-12 text-cyan-600 mb-4 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all" />
                <h3 className="text-sm font-bold tracking-widest text-cyan-200 mb-2">INSERTE ARCHIVOS DE DATOS</h3>
                <p className="text-xs text-cyan-600/80 tracking-widest">FORMATO REQUERIDO: PDF</p>
                <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={(e) => procesarArchivos(e.target.files)} />
              </div>
            )}

            {status !== 'idle' && (
              <div className="py-6">
                <div className="flex justify-between items-end mb-3 font-bold text-xs tracking-widest">
                  <span className="text-cyan-300 uppercase">{status === 'processing' ? 'Extrayendo nodos...' : 'Extracción Finalizada'}</span>
                  <span className={status === 'processing' ? 'text-amber-400' : 'text-cyan-400'}>{progress}%</span>
                </div>
                
                <div className="w-full bg-[#020617] border border-cyan-900 h-3 mb-6 relative">
                  <div className={`h-full transition-all duration-300 relative ${status === 'processing' ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${progress}%` }}>
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%,rgba(0,0,0,0.2)_100%)] bg-[size:10px_10px] opacity-50"></div>
                  </div>
                </div>

                {status === 'success' && (
                  <div className="flex flex-col gap-3 mt-8">
                    <button onClick={descargarExcels} className="w-full py-3 bg-[#082f49] hover:bg-cyan-900 border border-cyan-500 text-cyan-100 font-bold tracking-widest text-sm transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                      <Download className="w-4 h-4" /> DESCARGAR DATASET
                    </button>
                    <button onClick={() => setStatus('idle')} className="w-full py-2 text-cyan-600 hover:text-cyan-300 border border-transparent hover:border-cyan-800 text-xs font-bold tracking-widest uppercase transition-all">
                      [ NUEVO LOTE ]
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-[#030b17]/90 border border-cyan-800/60 flex flex-col h-[250px] relative">
            <div className="bg-[#020617] px-4 py-2 border-b border-cyan-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-cyan-500" />
                <span className="text-[10px] text-cyan-500 tracking-widest uppercase">Terminal de Operaciones // puerto_8000</span>
              </div>
            </div>
            <div className="p-4 overflow-y-auto text-[11px] space-y-2 custom-scrollbar">
              {logs.length === 0 && <div className="text-cyan-800 animate-pulse">Esperando comando de inicialización...</div>}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 opacity-90">
                  <span className="text-cyan-700 w-16 flex-shrink-0">[{log.time}]</span>
                  <span className={`${log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'system' ? 'text-cyan-200' : 'text-cyan-500'}`}>
                    {log.type === 'success' && '> '} {log.text}
                  </span>
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>

          {status === 'success' && (
            <div className="bg-[#030b17]/90 border border-cyan-800/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
              <div className="absolute top-0 right-0 w-20 h-1 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
              
              <div className="px-4 py-3 border-b border-cyan-800/60 bg-[#020617]">
                <h3 className="text-xs font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-500" /> REGISTROS VALIDADOS
                </h3>
              </div>
              <div className="overflow-x-auto h-[250px] custom-scrollbar">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-cyan-600 bg-[#020617]/50 border-b border-cyan-900/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-wider bg-[#020617]">ARCHIVO ORIGEN</th>
                      <th className="px-4 py-3 font-bold tracking-wider bg-[#020617]">ID_POLIZA</th>
                      <th className="px-4 py-3 font-bold tracking-wider bg-[#020617]">DOC_REF</th>
                      <th className="px-4 py-3 font-bold tracking-wider text-right bg-[#020617]">PRIMA_TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.map((row) => (
                      <tr key={row.id} className="border-b border-cyan-900/30 hover:bg-[#082f49]/30 transition-colors">
                        <td className="px-4 py-3 text-cyan-200 truncate max-w-[150px]">{row.file}</td>
                        <td className="px-4 py-3 text-cyan-400">{row.poliza}</td>
                        <td className="px-4 py-3 text-blue-300">{row.doc}</td>
                        <td className="px-4 py-3 font-bold text-green-400 text-right">{row.prima}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #020617; border-left: 1px solid rgba(22, 78, 99, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #0891b2; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #22d3ee; }
      `}} />
    </div>
  );
}