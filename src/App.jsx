import './App.css';
import wsCliente from './wsClienteClass'
import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = ["#378ADD", "#3B6D11", "#993556", "#854F0B", "#533AB7", "#0F6E56"];

function getColor(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function Avatar({ name, size = 32 }) {
  const color = getColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, color, flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
    }}>
      {name === "Todos" ? "T" : name.substring(0, 2).toUpperCase()}
    </div>
  );
}

function Checks({ leido }) {
  const color = leido ? "#378ADD" : "#aaa";
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" fill="none"
      style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polyline points="1,5 4,8 9,2"  stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="6,5 9,8 14,2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function Bubble({ msg, myName, onDelete }) {
  const isMe     = msg.emisor === myName;
  const isSystem = msg.type === "system";
  const [menu, setMenu] = useState(null);

  if (isSystem) return (
    <div style={{ textAlign: "center", margin: "4px 0" }}>
      <span style={{ fontSize: 11, color: "#888", background: "#f0f0f0", borderRadius: 99, padding: "2px 10px", fontFamily: "'DM Mono', monospace" }}>
        {msg.texto}
      </span>
    </div>
  );

  const abrirMenu = (e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); };
  const copiar = () => { navigator.clipboard.writeText(msg.texto); setMenu(null); };
  const borrar = () => { onDelete(msg.id); setMenu(null); };

  return (
    <>
      <div style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 2 }}>
        {!isMe && <Avatar name={msg.emisor} size={28} />}
        <div style={{ maxWidth: "68%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
          {!isMe && (
            <span style={{ fontSize: 11, color: getColor(msg.emisor), fontWeight: 600, marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>
              {msg.emisor}
            </span>
          )}
          <div onContextMenu={abrirMenu} style={{
            background: isMe ? "#1a1a2e" : "#f7f7f9",
            color: isMe ? "#e8e8f0" : "#1a1a2e",
            borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            padding: "9px 14px", fontSize: 13.5, lineHeight: 1.55,
            border: isMe ? "none" : "0.5px solid #e0e0e8", wordBreak: "break-word",
            cursor: "default", userSelect: "text",
          }}>
            {msg.texto}
          </div>
          <span style={{ fontSize: 10, color: "#aaa", marginTop: 3, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 3 }}>
            {msg.hora}
            {isMe && <Checks leido={!!msg.leido} />}
          </span>
        </div>
      </div>
      {menu && (
        <>
          <div onClick={() => setMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 200 }} />
          <div style={{
            position: "fixed", left: menu.x, top: menu.y, zIndex: 201,
            background: "white", borderRadius: 10, overflow: "hidden",
            boxShadow: "0 4px 20px #0002", border: "0.5px solid #e0e0ec",
            minWidth: 140, fontFamily: "'DM Sans', sans-serif",
          }}>
            <div onClick={copiar} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}>Copiar</div>
            {isMe && (
              <div onClick={borrar} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: "#e05555", borderTop: "0.5px solid #eee" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>Borrar</div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function Login({ onConectar, error }) {
  const [nameInput, setNameInput] = useState("");
  return (
    <div style={{
      minHeight: 480, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 32,
      background: "linear-gradient(135deg, #f8f8fc 0%, #f0f0f8 100%)",
      borderRadius: 16, border: "0.5px solid #e0e0ec",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a2e", marginBottom: 6, letterSpacing: -0.3 }}>Chat WebSocket</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28, textAlign: "center" }}>Ingresa tu nombre para conectarte al servidor</p>
      <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 280 }}>
        <input autoFocus value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onConectar(nameInput)}
          placeholder="Tu nombre (ej. Mario)" maxLength={20}
          style={{ flex: 1, padding: "10px 14px", fontSize: 14, borderRadius: 10, border: "1px solid #ddd", outline: "none", fontFamily: "inherit", background: "white", color: "#1a1a2e" }}
        />
        <button onClick={() => onConectar(nameInput)} style={{ padding: "10px 18px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Entrar
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 12, textAlign: "center" }}>{error}</p>}
    </div>
  );
}

function ModalGrupo({ modo, grupoActual, usuarios, connected, onGuardar, onCerrar }) {
  const esEditar = modo === "editar";
  const integrantesIniciales = esEditar && grupoActual?.integrantes
    ? (typeof grupoActual.integrantes === "string" ? JSON.parse(grupoActual.integrantes) : grupoActual.integrantes)
    : [];
  const [nombre, setNombre] = useState(esEditar ? grupoActual.id : "");
  const [seleccionados, setSeleccionados] = useState(integrantesIniciales);
  const [errorModal, setErrorModal] = useState("");

  const toggleIntegrante = (name) =>
    setSeleccionados(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const guardar = () => {
    if (!nombre.trim()) return setErrorModal("El nombre del grupo es requerido");
    if (seleccionados.length === 0) return setErrorModal("Selecciona al menos un integrante");
    onGuardar(nombre.trim().toUpperCase(), seleccionados);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000055", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "white", borderRadius: 14, padding: 24, width: 320, boxShadow: "0 8px 32px #0002", fontFamily: "'DM Sans', sans-serif" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>{esEditar ? "Editar grupo" : "Nuevo grupo"}</h3>
        <label style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} disabled={esEditar}
          placeholder="Ej. GRUPO1" maxLength={20}
          style={{ width: "100%", marginTop: 4, marginBottom: 14, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, fontFamily: "inherit", color: "#1a1a2e", boxSizing: "border-box", background: esEditar ? "#f5f5f5" : "white" }}
        />
        <label style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Integrantes</label>
        <div style={{ marginTop: 6, marginBottom: 14, display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
          {usuarios.length === 0 && <p style={{ fontSize: 12, color: "#bbb", fontFamily: "'DM Mono', monospace" }}>No hay usuarios registrados</p>}
          {usuarios.map(name => {
            const isOnline = connected.includes(name);
            return (
              <div key={name} onClick={() => toggleIntegrante(name)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                background: seleccionados.includes(name) ? "#1a1a2e08" : "transparent",
                border: seleccionados.includes(name) ? "1px solid #1a1a2e22" : "1px solid transparent",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar name={name} size={24} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 7, height: 7, borderRadius: "50%", background: isOnline ? "#4ade80" : "#ccc", border: "1.5px solid white" }} />
                </div>
                <span style={{ flex: 1, fontSize: 13 }}>{name}</span>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: seleccionados.includes(name) ? "#1a1a2e" : "white", border: "1.5px solid " + (seleccionados.includes(name) ? "#1a1a2e" : "#ccc"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {seleccionados.includes(name) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            );
          })}
        </div>
        {errorModal && <p style={{ fontSize: 12, color: "#c0392b", marginBottom: 10 }}>{errorModal}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCerrar} style={{ padding: "8px 16px", background: "#f0f0f0", color: "#555", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={guardar} style={{ padding: "8px 16px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// Clave única para chat privado: siempre ordenada alfabéticamente
function chatKey(a, b) { return [a, b].sort().join("|"); }

// Nombre legible a mostrar en UI dado un chatId
function chatLabel(chatId, myName) {
  if (!chatId.includes("|")) return chatId;
  return chatId.split("|").find(n => n !== myName) || chatId;
}

export default function App() {
  const [stage, setStage]         = useState("login");
  const [myName, setMyName]       = useState("");
  const [error, setError]         = useState("");
  const [connected, setConnected] = useState([]);
  const [recipient, setRecipient] = useState("Todos");
  const [messages, setMessages]   = useState({});
  const [unread, setUnread]       = useState({});
  const [input, setInput]         = useState("");
  const [wsStatus, setWsStatus]   = useState("off");
  const [grupos, setGrupos]       = useState([]);
  const [usuariosConocidos, setUsuariosConocidos] = useState([]);
  const [modalGrupo, setModalGrupo] = useState(null);

  const wsRef        = useRef(null);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const recipientRef = useRef("Todos");
  const msgIdRef     = useRef(0);
  const connectedRef = useRef([]);
  const myNameRef    = useRef("");
  const gruposRef    = useRef([]);

  // Sin IndexedDB: el historial y grupos vienen del servidor al conectarse

  const nowTime = () => {
    const d = new Date();
    return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
  };

  const addMsg = useCallback((chat, msg) => {
    const id = ++msgIdRef.current;
    setMessages(prev => ({ ...prev, [chat]: [...(prev[chat] || []), { ...msg, id }] }));
  }, []);

  const deleteMsg = useCallback((chat, msgId) => {
    setMessages(prev => ({ ...prev, [chat]: (prev[chat] || []).filter(m => m.id !== msgId) }));
  }, []);

  // Marca todos los mensajes de un chat como leídos en el estado de React
  const markLeidoChat = useCallback((chatId) => {
    setMessages(prev => {
      if (!prev[chatId]) return prev;
      return { ...prev, [chatId]: prev[chatId].map(m => ({ ...m, leido: true })) };
    });
  }, []);

  const addUnread = useCallback((chat) => {
    setUnread(prev => {
      if (recipientRef.current === chat) return prev;
      return { ...prev, [chat]: (prev[chat] || 0) + 1 };
    });
  }, []);

  const parsearIntegrantes = (integrantes) => {
    if (Array.isArray(integrantes)) return integrantes;
    try { return JSON.parse(integrantes); } catch { return []; }
  };

  const abrirChat = useCallback((chatId, nombreReal) => {
    setRecipient(chatId);
    recipientRef.current = chatId;
    setUnread(prev => ({ ...prev, [chatId]: 0 }));
    // Solo notificar al otro que leímos sus mensajes (chats privados).
    // Las palomitas del EMISOR cambian a azul únicamente cuando llega onLeido,
    // es decir cuando el DESTINATARIO abre el chat — no cuando lo abre el emisor.
    if (chatId !== "Todos" && chatId.includes("|") && wsRef.current)
      wsRef.current.enviarLeido(nombreReal, chatId);
  }, []);

  // Gestión de grupos
  const guardarGrupo = (id, integrantesBase) => {
    const existe = grupos.find(g => g.id === id);
    const accion = existe ? "editar" : "crear";
    const integrantes = integrantesBase.includes(myName) ? integrantesBase : [...integrantesBase, myName];
    const integrantesAnteriores = existe ? parsearIntegrantes(existe.integrantes) : [];
    const integrantesEliminados = integrantesAnteriores.filter(n => !integrantes.includes(n));

    // Actualizar estado local inmediatamente
    const nuevosGrupos = existe
      ? grupos.map(g => g.id === id ? { id, integrantes } : g)
      : [...grupos, { id, integrantes }];
    setGrupos(nuevosGrupos);
    gruposRef.current = nuevosGrupos;
    setModalGrupo(null);

    // El servidor persiste el grupo en BD y notifica a los demás
    if (wsRef.current)
      wsRef.current.enviarGrupo(id, integrantes, accion, integrantesEliminados);
  };

  const eliminarGrupo = (id) => {
    const grupo = grupos.find(g => g.id === id);
    const integrantes = grupo ? parsearIntegrantes(grupo.integrantes) : [];

    // Actualizar estado local
    const nuevosGrupos = grupos.filter(g => g.id !== id);
    setGrupos(nuevosGrupos);
    gruposRef.current = nuevosGrupos;

    if (recipientRef.current === id) {
      setRecipient("Todos");
      recipientRef.current = "Todos";
    }
    // El servidor elimina el grupo en BD y notifica a los demás
    if (wsRef.current && integrantes.length > 0)
      wsRef.current.enviarGrupo(id, integrantes, "eliminar");
  };

  const conectar = (nombre) => {
    nombre = nombre.trim();
    if (!nombre) return;
    if (wsRef.current?.ws?.readyState === WebSocket.OPEN) wsRef.current.ws.close();
    setError("");

    const cliente = new wsCliente(nombre, {
      onOpen: () => {
        setWsStatus("on");
        setMyName(nombre);
        myNameRef.current = nombre;
        setStage("chat");
        // El historial llega por el evento HISTORIAL que manda el servidor
        // justo después de identificarse. No hacemos nada aquí todavía.
      },

      onError: () => setError("No se pudo conectar. ¿El servidor está corriendo?"),

      onClose: () => {
        if (wsRef.current?.ws !== cliente.ws) return;
        setWsStatus("off");
        addMsg("Todos", { type: "system", texto: "Desconectado del servidor", hora: nowTime() });
      },

      // El servidor manda el historial completo al conectarse
      onHistorial: (mensajes) => {
        if (!mensajes?.length) {
          addMsg("Todos", { type: "system", texto: "Conectado como " + nombre, hora: nowTime() });
          return;
        }
        const porChat = {};
        let maxId = 0;
        for (const msg of mensajes) {
          if (!porChat[msg.chat]) porChat[msg.chat] = [];
          porChat[msg.chat].push({ ...msg, leido: !!msg.leido });
          if (msg.id > maxId) maxId = msg.id;
        }
        msgIdRef.current = maxId;
        setMessages(porChat);

        // Calcular badges
        const unreadInicial = {};
        for (const [chat, msgs] of Object.entries(porChat)) {
          const noLeidos = msgs.filter(m => !m.leido && m.emisor !== nombre).length;
          if (noLeidos > 0) unreadInicial[chat] = noLeidos;
        }
        if (Object.keys(unreadInicial).length > 0) setUnread(unreadInicial);

        addMsg("Todos", { type: "system", texto: "Conectado como " + nombre, hora: nowTime() });
      },

      // El servidor manda los grupos donde participa el usuario
      onGruposIniciales: (data) => {
        if (!data?.length) return;
        const parsed = data.map(g => ({
          ...g,
          integrantes: typeof g.integrantes === "string" ? JSON.parse(g.integrantes) : g.integrantes
        }));
        setGrupos(parsed);
        gruposRef.current = parsed;
      },

      onConectados: (data) => {
        if (!data) return;
        setConnected(data);
        connectedRef.current = data;
        // Los usuarios conectados también se agregan a conocidos
        data.forEach(n => {
          setUsuariosConocidos(prev => prev.includes(n) ? prev : [...prev, n]);
        });
      },

      // El servidor manda todos los usuarios históricos al conectarse
      onTodosUsuarios: (data) => {
        if (!data?.length) return;
        setUsuariosConocidos(prev => {
          const nuevos = data.filter(n => n !== myNameRef.current && !prev.includes(n));
          return nuevos.length ? [...prev, ...nuevos] : prev;
        });
      },

      onLeido: (data) => {
        // data.lector leyó nuestros mensajes — marcar como leído el chat con esa persona
        if (!data?.lector) return;
        const chatId = chatKey(nombre, data.lector);
        markLeidoChat(chatId);
      },

      onGrupo: (data) => {
        if (!data) return;
        const { id, integrantes, accion } = data;
        if (accion === "eliminar") {
          if (recipientRef.current === id) { setRecipient("Todos"); recipientRef.current = "Todos"; }
          setMessages(prev => { const next = { ...prev }; delete next[id]; return next; });
          setGrupos(prev => {
            const next = prev.filter(g => g.id !== id);
            gruposRef.current = next;
            return next;
          });
        } else {
          setGrupos(prev => {
            const existe = prev.find(g => g.id === id);
            const next = existe
              ? prev.map(g => g.id === id ? { id, integrantes } : g)
              : [...prev, { id, integrantes }];
            gruposRef.current = next;
            return next;
          });
        }
      },

      onChat: (data) => {
        if (!data) return;
        const { id, emisor, mensaje: texto, canal, hora } = data;
        const yo = myNameRef.current;
        const esGrupo = canal && canal !== "Todos" && gruposRef.current.find(g => g.id === canal);
        const chatId  = canal === "Todos" ? "Todos"
                      : esGrupo           ? canal
                      :                     chatKey(emisor, yo);
        const estaViendo = recipientRef.current === chatId;

        // El servidor ya guarda el mensaje en BD; aquí solo actualizamos el estado React
        addMsg(chatId, { id, emisor, texto, hora, leido: estaViendo });

        if (estaViendo && chatId !== "Todos") {
          // Notificar al emisor que fue leído
          if (wsRef.current) wsRef.current.enviarLeido(emisor, chatId);
        } else if (chatId !== "Todos") {
          addUnread(chatId);
        }
      }
    });

    wsRef.current = cliente;
  };

  const sendMsg = () => {
    const texto = input.trim();
    if (!texto || !wsRef.current) return;

    const grupoSeleccionado = grupos.find(g => g.id === recipient);
    let receptor, canal;

    if (grupoSeleccionado) {
      receptor = parsearIntegrantes(grupoSeleccionado.integrantes).filter(n => n !== myName);
      canal    = recipient;
    } else if (recipient === "Todos") {
      receptor = connectedRef.current;
      canal    = "Todos";
    } else {
      // recipient es chatKey, extraer nombre real del otro
      const otroUsuario = recipient.split("|").find(n => n !== myName);
      receptor = [otroUsuario];
      canal    = otroUsuario;
    }

    wsRef.current.enviarChat(receptor, canal, texto);

    // Para mensajes privados y grupos, agregar al estado local inmediatamente
    // sin esperar el echo del servidor (el servidor no manda echo al emisor en privados).
    // Para "Todos" sí llega echo, así que NO lo agregamos aquí.
    if (recipient !== "Todos") {
      const hora = nowTime();
      addMsg(recipient, { emisor: myName, texto, hora, leido: false });
    }

    setInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, recipient]);

  if (stage === "login") return <Login onConectar={conectar} error={error} />;

  const currentMessages = messages[recipient] || [];
  const gruposFiltrados = grupos.filter(g => parsearIntegrantes(g.integrantes).includes(myName));
  const labelRecipient  = chatLabel(recipient, myName);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 560, fontFamily: "'DM Sans', sans-serif", background: "white", borderRadius: 16, border: "0.5px solid #e0e0ec", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#ddd;border-radius:99px}
      `}</style>

      {modalGrupo && (
        <ModalGrupo modo={modalGrupo.modo} grupoActual={modalGrupo.grupoActual}
          usuarios={usuariosConocidos.filter(n => n !== myName)} connected={connected}
          onGuardar={guardarGrupo} onCerrar={() => setModalGrupo(null)} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#1a1a2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: wsStatus === "on" ? "#4ade80" : "#f87171" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{myName}</span>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#888" }}>ws://localhost:8080</span>
        </div>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#ffffff11", padding: "3px 10px", borderRadius: 99, border: "0.5px solid #ffffff22", color: "#aaa" }}>
          {connected.length} conectado{connected.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Barra lateral */}
        <div style={{ width: 160, borderRight: "0.5px solid #eee", display: "flex", flexDirection: "column", background: "#fafafa", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#aaa", padding: "10px 12px 6px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Chats</div>
          <div style={{ overflowY: "auto" }}>
            {/* Todos */}
            {(() => {
              const isActive = recipient === "Todos";
              const badge = unread["Todos"] || 0;
              return (
                <div onClick={() => abrirChat("Todos", "Todos")} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13,
                  background: isActive ? "#1a1a2e" : "transparent", color: isActive ? "white" : "#333",
                  borderLeft: isActive ? "3px solid #378ADD" : "3px solid transparent", transition: "all 0.15s",
                }}>
                  <Avatar name="Todos" size={26} />
                  <span style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>Todos</span>
                  {badge > 0 && <span style={{ fontSize: 10, background: "#378ADD", color: "white", borderRadius: 99, padding: "1px 6px", fontFamily: "'DM Mono', monospace", minWidth: 18, textAlign: "center" }}>{badge}</span>}
                </div>
              );
            })()}
            {/* Usuarios conocidos */}
            {usuariosConocidos.filter(n => n !== myName).map(name => {
              const key      = chatKey(myName, name);
              const isActive = recipient === key;
              const isOnline = connected.includes(name);
              const badge    = unread[key] || 0;
              return (
                <div key={name} onClick={() => abrirChat(key, name)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13,
                  background: isActive ? "#1a1a2e" : "transparent", color: isActive ? "white" : "#333",
                  borderLeft: isActive ? "3px solid #378ADD" : "3px solid transparent", transition: "all 0.15s",
                }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar name={name} size={26} />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: isOnline ? "#4ade80" : "#aaa", border: "1.5px solid " + (isActive ? "#1a1a2e" : "#fafafa") }} />
                  </div>
                  <span style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>{name}</span>
                  {badge > 0 && <span style={{ fontSize: 10, background: "#378ADD", color: "white", borderRadius: 99, padding: "1px 6px", fontFamily: "'DM Mono', monospace", minWidth: 18, textAlign: "center" }}>{badge}</span>}
                </div>
              );
            })}
          </div>

          {/* Grupos */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px 6px", borderTop: "0.5px solid #eee", marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Grupos</span>
            <button onClick={() => setModalGrupo({ modo: "crear" })} title="Nuevo grupo"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, lineHeight: 1, padding: 0 }}>+</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {gruposFiltrados.length === 0 && <p style={{ fontSize: 11, color: "#ccc", padding: "4px 12px", fontFamily: "'DM Mono', monospace" }}>Sin grupos</p>}
            {gruposFiltrados.map(grupo => {
              const isActive = recipient === grupo.id;
              const badge    = unread[grupo.id] || 0;
              return (
                <div key={grupo.id} style={{ position: "relative" }}>
                  <div onClick={() => abrirChat(grupo.id, grupo.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13,
                    background: isActive ? "#1a1a2e" : "transparent", color: isActive ? "white" : "#333",
                    borderLeft: isActive ? "3px solid #854F0B" : "3px solid transparent", transition: "all 0.15s",
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#854F0B22", border: "1.5px solid #854F0B44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#854F0B", flexShrink: 0 }}>G</div>
                    <span style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>{grupo.id}</span>
                    {badge > 0 && <span style={{ fontSize: 10, background: "#854F0B", color: "white", borderRadius: 99, padding: "1px 6px", fontFamily: "'DM Mono', monospace", minWidth: 18, textAlign: "center" }}>{badge}</span>}
                  </div>
                  <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 2 }}>
                    <button onClick={e => { e.stopPropagation(); setModalGrupo({ modo: "editar", grupoActual: grupo }); }} title="Editar"
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#aaa", padding: "2px 3px" }}>✎</button>
                    <button onClick={e => { e.stopPropagation(); eliminarGrupo(grupo.id); }} title="Eliminar"
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#e05555", padding: "2px 3px" }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Área de chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "8px 16px", borderBottom: "0.5px solid #eee", fontSize: 12, color: "#888", fontFamily: "'DM Mono', monospace" }}>
            Para: <strong style={{ color: getColor(labelRecipient) }}>{labelRecipient}</strong>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {currentMessages.length === 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 12, color: "#ccc", fontFamily: "'DM Mono', monospace" }}>Sin mensajes aún</p>
              </div>
            )}
            {currentMessages.map((msg, i) => <Bubble key={i} msg={msg} myName={myName} onDelete={(id) => deleteMsg(recipient, id)} />)}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "10px 14px", borderTop: "0.5px solid #eee", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder={`Mensaje para ${labelRecipient}...`} rows={1}
              style={{ flex: 1, resize: "none", padding: "9px 13px", fontSize: 13.5, borderRadius: 10, border: "1px solid #e0e0ec", outline: "none", fontFamily: "inherit", color: "#1a1a2e", background: "#fafafa", minHeight: 38, maxHeight: 90 }}
            />
            <button onClick={sendMsg} disabled={!input.trim()} style={{
              padding: "9px 18px", background: input.trim() ? "#1a1a2e" : "#f0f0f0",
              color: input.trim() ? "white" : "#bbb", border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: input.trim() ? "pointer" : "default",
              fontFamily: "inherit", height: 38, transition: "all 0.15s",
            }}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}