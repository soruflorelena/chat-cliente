class wsCliente {
	constructor(cliente, eventos = {}) {
		// En producción la URL viene de la variable de entorno de Vite
		const url = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
		this.ws = new WebSocket(url)
		this.eventos = eventos
		this.nombre = cliente

		this.ws.onopen = () => {
			if (this.eventos.onOpen)
				this.eventos.onOpen()
		}

		this.ws.onclose = () => {
			if (this.eventos.onClose)
				this.eventos.onClose()
		}

		this.ws.onerror = () => {
			if (this.eventos.onError)
				this.eventos.onError()
		}

		this.ws.onmessage = (event) => {
			const datos = this.jsonAJS(event.data)
			if (!datos) return

			const { mensaje, data } = datos

			if (this[mensaje] && typeof this[mensaje] === "function")
				this[mensaje](data)
		}
	}

	// ─── Mensajes entrantes ───────────────────────────────────────────────────

	IDENTIFICATE() {
		this.MSG("IDENTIFICACION", this.nombre)
		this.MSG("CONECTADOS")
	}

	CONECTADOS(data) {
		this.eventos.onConectados?.(data)
	}

	CHAT(data) {
		this.eventos.onChat?.(data)
	}

	LEIDO(data) {
		this.eventos.onLeido?.(data)
	}

	GRUPO(data) {
		this.eventos.onGrupo?.(data)
	}

	// El servidor manda el historial completo al conectarse
	HISTORIAL(data) {
		this.eventos.onHistorial?.(data)
	}

	// El servidor manda los grupos donde participa el usuario
	GRUPOS_INICIALES(data) {
		this.eventos.onGruposIniciales?.(data)
	}

	// ─── Mensajes salientes ───────────────────────────────────────────────────

	enviarChat(receptor, canal, mensaje) {
		this.MSG("CHAT", { receptor, canal, mensaje })
	}

	enviarGrupo(id, integrantes, accion, integrantesEliminados = []) {
		this.MSG("GRUPO", { id, integrantes, accion, integrantesEliminados })
	}

	enviarLeido(emisor, chatId) {
		this.MSG("LEIDO", { emisor, chatId })
	}

	// ─── Auxiliares ───────────────────────────────────────────────────────────

	MSG(mensaje, data = null) {
		const msg = data != null
			? this.JSAJson({ mensaje, data })
			: this.JSAJson({ mensaje })

		if (msg) this.ws.send(msg)
	}

	jsonAJS(json) {
		try { return JSON.parse(json) }
		catch { return false }
	}

	JSAJson(js) {
		try { return JSON.stringify(js) }
		catch { return false }
	}
}

export default wsCliente