(() => {
  /* ── costanti globali ── */
  const W    = 1280;
  const H    = 720;
  const ACQUA       = 252;
  const ALTEZZA_ZONA = (H - ACQUA) / 6;
  const AMO_Y_MIN = ACQUA + 20;
  const AMO_Y_MAX = H - 34;
  const AMO_PRONTO_Y = ACQUA - 118;
  const AMO_X_OFFSET = 170;
  const PROFONDITA_GIOCABILE = AMO_Y_MAX - AMO_Y_MIN;
  const CHIAVE = "pesca_abissale_salva_v6";
  const CHIAVE_IMPOSTAZIONI = "crazy_catch_impostazioni_v1";
  const IMPOSTAZIONI_BASE = {
    luminosita: 1,
    volumeMusica: 0.78,
    volumeEffetti: 0.82,
    muto: false
  };

  let impostazioni = caricaImpostazioni();

  /* ── zone acqua ── */
  const zone = [
    ["Superficie",   "#68C9F2"],
    ["Acque Medie",  "#2F8ED0"],
    ["Profondita",   "#18508B"],
    ["Abisso",       "#08234A"],
    ["Vuoto Eterno", "#050719"],
    ["Il Baratro",   "#000000"]
  ];

  /* ── rarità ── */
  const rarita = {
    COMUNE:      ["#888780", 1000],
    INSOLITO:    ["#3B6D11", 260],
    RARO:        ["#185FA5", 18],
    EPICO:       ["#534AB7",  2.5],
    LEGGENDARIO: ["#BA7517",  0.45],
    ANTICO:      ["#791F1F",  0.07],
    MITICO:      ["#993556",  0.015],
    DIVINO:      ["arcobaleno", 0.002]
  };
  const ordine = Object.keys(rarita);

  /* ── luoghi ── */
  const luoghi = [
    {
      id: "molo",    nome: "Molo Lunare",
      costo: 0,    cielo: "#050817", legno: "#3E2615", alga: "#2B8D63",
      acque: ["#66C6F1","#2C8BD3","#154A86","#071F43","#050716","#000000"],
      lim: [105, 620], bonus: "Equilibrato"
    },
    {
      id: "laguna",  nome: "Laguna Smeraldo",
      costo: 150,  cielo: "#0D2B2A", legno: "#2E4A25", alga: "#47D37B",
      acque: ["#7FE2CF","#38AFA6","#17747B","#0B3E54","#051B2B","#000306"],
      lim: [90, 720], bonus: "+10% Insolito"
    },
    {
      id: "corallo", nome: "Scogliera di Corallo",
      costo: 600,  cielo: "#102342", legno: "#5E3A2B", alga: "#E05A86",
      acque: ["#58D6E6","#2386C9","#16569D","#0A2B68","#06102B","#010108"],
      lim: [100, 780], bonus: "+8% Raro+"
    },
    {
      id: "fiordo",  nome: "Fiordo Ghiacciato",
      costo: 1200, cielo: "#1C3156", legno: "#C7D8E6", alga: "#9FE7D7",
      acque: ["#9BE8FF","#4FAEE2","#256EA5","#123D70","#071B3B","#01040D"],
      lim: [90, 690], bonus: "+15% valore"
    },
    {
      id: "palude",  nome: "Palude Nebbiosa",
      costo: 2500, cielo: "#171C16", legno: "#304022", alga: "#75A83A",
      acque: ["#789B74","#426F68","#254B54","#132E3B","#061520","#000303"],
      lim: [85, 660], bonus: "+12% Antico di notte"
    },
    {
      id: "rovine",  nome: "Rovine Abissali",
      costo: 5000, cielo: "#090719", legno: "#29213D", alga: "#6A4BB8",
      acque: ["#3269A6","#184883","#0B2C63","#061640","#030617","#000000"],
      lim: [80, 820], bonus: "+10% Epico+"
    }
  ];

  /* ── meteo ── */
  const meteo = [
    { id: "sereno",    nome: "Sereno",     icona: "☀",  morso: 1,    valore: 1, solo: null, finestra: null },
    { id: "pioggia",   nome: "Pioggia",    icona: "🌧",  morso: 1.45, valore: 1, solo: null, finestra: 0.85 },
    { id: "temporale", nome: "Temporale",  icona: "⛈",  morso: 1,    valore: 2, solo: ["EPICO","LEGGENDARIO","ANTICO","MITICO","DIVINO"], finestra: null },
    { id: "nebbia",    nome: "Nebbia",     icona: "🌫",  morso: 2.4,  valore: 1, solo: ["COMUNE"], finestra: null },
    { id: "marea",     nome: "Marea Alta", icona: "🌊",  morso: 1,    valore: 1, solo: null, finestra: null }
  ];

  /* ── negozio ── */
  const negozio = [
    { id: "canna_fibra",      nome: "Canna in Fibra",        costo: 250,   testo: "Piu controllo, fondali medi appena raggiungibili.", tipo: "canna", finestra: 1.22, depthBonus: 0.10, maxNorm: 0.44, controllo: 0.78, luck: 0.015, sink: 0.92, colore: "#7B9EC8" },
    { id: "canna_carbonio",   nome: "Canna al Carbonio",     costo: 1000,  testo: "Lancio stabile e profondita media affidabile.",      tipo: "canna", finestra: 1.55, depthBonus: 0.22, maxNorm: 0.59, controllo: 0.88, luck: 0.035, sink: 1.05, colore: "#A6B4C8" },
    { id: "canna_leggendaria",nome: "Canna Leggendaria",     costo: 4200,  testo: "Apre l'Abisso, ma i pesci forti restano rari.",      tipo: "canna", finestra: 2.05, depthBonus: 0.38, maxNorm: 0.76, controllo: 0.97, luck: 0.060, sink: 1.18, colore: "#F6D36B" },
    { id: "canna_abissale",   nome: "Canna Abissale",        costo: 12000, testo: "Arriva vicino al Baratro e regge i morsi pesanti.",  tipo: "canna", finestra: 2.35, depthBonus: 0.55, maxNorm: 0.95, controllo: 1.08, luck: 0.090, sink: 1.34, colore: "#9B6BFF" },
    { id: "esca_brillante",   nome: "Esca Brillante",        costo: 700,   testo: "Spinge un po' gli Insoliti, senza regalare rarita.", tipo: "esca" },
    { id: "esca_profonda",    nome: "Esca Profonda",         costo: 3200,  testo: "Aiuta Raro+, ma solo dove l'amo scende davvero.",    tipo: "esca" },
    { id: "retino_fortuna",   nome: "Retino della Fortuna",  costo: 6500,  testo: "Ogni decima cattura e almeno Rara.",                tipo: "speciale" }
  ];

  const cannaBase = {
    id: "",
    nome: "Canna Base",
    finestra: 0.82,
    depthBonus: 0,
    maxNorm: 0.30,
    controllo: 0.62,
    luck: 0.004,
    sink: 0.78,
    colore: "#9E6B3F"
  };

  /* ── database pesci ── */
  const nomi = (
    "Sardina,Acciuga,Persico,Tinca,Carpa,Gobione,Alborella,Lasca,Cavedano,Ghiozzo," +
    "Boga,Scardola,Triotto,Vairone,Anguilla Comune,Cobite,Rutilo,Savetta," +
    "Pigo,Cagnetta di Mare,Trota Dorata,Pesce Pagliaccio,Anguilla Verde,Merluzzo Azzurro," +
    "Salmone Rosa,Pesce Pilota,Rombo Minore,Orata Giovane,Spigola Argentata,Luccio Nano," +
    "Pesce Ago,Sogliola Comune,Pesce San Pietro,Cefalo Striato,Triglia Rossa,Nasello Giovane," +
    "Pesce Castagna,Zerro,Tonno Blu,Barracuda Notte,Murena Viola,Cernia Fantasma," +
    "Pesce Spada,Ricciola Blu,Dentice Reale,Pesce Luna,Lampuga,Gronco," +
    "Pesce Scorpione,Scorfano Nobile,Cernia Bruna,Pesce Specchio,Corvina Nera," +
    "Palamita Selvaggia,Manta Oscura,Calamaro Viola,Polpo Reale,Drago di Mare," +
    "Squalo Rosso,Pesce Sega,Pesce Cofano,Pesce Napoleone,Anguilla Elettrica," +
    "Pesce Fantasma,Squalo Toro,Cefalopode Antico,Razze Fantasma,Trigone Viola," +
    "Leviatano d'Oro,Fenice Marina,Tartaruga Antica,Serpente Abissale,Kraken Minore," +
    "Pesce Arpa,Chimera Dorata,Balena Nana,Squalo Dorato,Il Pesce Senza Nome," +
    "Delfino Dorato,Narvalo d'Ambra,Orca Bianca,Pesce Abissale d'Oro,Celacanto Rosso," +
    "Ammonite Vivente,Pesce Armato,Dunkleosteus,Helicoprion,Pesce Fantasma Rosso," +
    "Xenacanthus,Tiktaalik,Mawsonia,Kronosaurus,Spinosaurus Marino," +
    "L'Ombra del Passato,Sirena Fossile,Pesce Luna Eterno,Angelo del Profondo," +
    "Demone Abissale,Chimera della Notte,Pesce Stella Cadente,Il Dormiente," +
    "Ombra Senza Fondo,Pesce delle Stelle,Il Re degli Abissi,L'Innominabile," +
    "Pesce Primordiale,Il Vuoto con gli Occhi,Dio dell'Acqua,La Prima Onda," +
    "Eternita Pesata,Il Pesce Che Non C'è,Origine"
  ).split(",");

  const blocchi = [
    ["COMUNE",      20,  8],
    ["INSOLITO",    18, 35],
    ["RARO",        16, 120],
    ["EPICO",       14, 420],
    ["LEGGENDARIO", 14, 1800],
    ["ANTICO",      12, 8000],
    ["MITICO",      10, 35000],
    ["DIVINO",       8, 99999]
  ];

  const pesci = [];
  let id = 1;
  let offset = 0;
  for (const [r, n, v] of blocchi) {
    for (let i = 0; i < n; i += 1, id += 1) {
      pesci.push({
        id,
        nome: nomi[offset + i],
        rarita: r,
        valore: v + i * 7,
        colore: rarita[r][0],
        desc: "Una cattura da ricordare. Il mare approva con sospetto."
      });
    }
    offset += n;
  }

  /* ── utility ── */
  function col(hex) {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }

  function colorePesce(p) {
    return p.colore !== "arcobaleno" ? p.colore : "#F6D36B";
  }

  /* Immagine SVG pesce (usata come fallback in preload) */
  function svgPesce(p) {
    const c    = colorePesce(p);
    const grad = p.colore === "arcobaleno"
      ? `<linearGradient id="g">
           <stop offset="0"   stop-color="#ff3b3b"/>
           <stop offset=".2"  stop-color="#ffe34d"/>
           <stop offset=".4"  stop-color="#54ff7a"/>
           <stop offset=".6"  stop-color="#45c7ff"/>
           <stop offset=".8"  stop-color="#9a5cff"/>
           <stop offset="1"   stop-color="#ff61d8"/>
         </linearGradient>`
      : "";
    const fill = p.colore === "arcobaleno" ? "url(#g)" : c;
    const glow = ["LEGGENDARIO","ANTICO","MITICO","DIVINO"].includes(p.rarita) ? 2.5 : 1.1;
    const svg  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48" shape-rendering="crispEdges">
      <defs>
        ${grad}
        <filter id="b">
          <feGaussianBlur stdDeviation="${glow}"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g filter="url(#b)">
        <path d="M7 24l21-15v30z" fill="#15151c"/>
        <ellipse cx="50" cy="24" rx="34" ry="16" fill="${fill}"/>
        <path d="M34 15c16-7 34-4 47 8-18-3-34 0-51 7z" fill="#fff" opacity=".28"/>
        <path d="M46 36l15 10 7-13z" fill="#15151c" opacity=".7"/>
        <circle cx="73" cy="20" r="3" fill="#03040a"/>
        <circle cx="74" cy="19" r="1" fill="#fff"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function chiavePesce(fishId) {
    return `pa${fishId}`;
  }

  function filePesce(fishId) {
    return String(fishId).padStart(3, "0");
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function caricaImpostazioni() {
    try {
      const salvate = JSON.parse(localStorage.getItem(CHIAVE_IMPOSTAZIONI) || "{}");
      return {
        ...IMPOSTAZIONI_BASE,
        ...salvate,
        luminosita: clamp(Number(salvate.luminosita ?? IMPOSTAZIONI_BASE.luminosita), 0.65, 1.25),
        volumeMusica: clamp(Number(salvate.volumeMusica ?? IMPOSTAZIONI_BASE.volumeMusica), 0, 1),
        volumeEffetti: clamp(Number(salvate.volumeEffetti ?? IMPOSTAZIONI_BASE.volumeEffetti), 0, 1),
        muto: !!salvate.muto
      };
    } catch (_) {
      return { ...IMPOSTAZIONI_BASE };
    }
  }

  function salvaImpostazioni() {
    localStorage.setItem(CHIAVE_IMPOSTAZIONI, JSON.stringify(impostazioni));
  }

  function preparaAudio(scene) {
    let tracce = scene.game.registry.get("audioTracce");
    if (!tracce) {
      tracce = {
        musica: scene.sound.add("musica_chill",  { loop: true, volume: 0.34 }),
        acqua:  scene.sound.add("acqua_loop",    { loop: true, volume: 0.22 }),
        molo:   scene.sound.add("ambiente_molo", { loop: true, volume: 0.14 })
      };
      scene.game.registry.set("audioTracce", tracce);
    }
    applicaVolumi(scene);
    return tracce;
  }

  function applicaVolumi(scene) {
    const tracce = scene.game.registry.get("audioTracce");
    if (tracce) {
      tracce.musica.setVolume(0.34 * impostazioni.volumeMusica);
      tracce.acqua.setVolume(0.22 * impostazioni.volumeMusica);
      tracce.molo.setVolume(0.14 * impostazioni.volumeMusica);
    }
    scene.sound.mute = impostazioni.muto;
  }

  function avviaAudioGlobale(scene, manuale = false) {
    if (impostazioni.muto && !manuale) return false;
    const tracce = preparaAudio(scene);
    Object.values(tracce).forEach((suono) => {
      if (!suono.isPlaying) suono.play();
    });
    scene.game.registry.set("audioAvviato", true);
    return true;
  }

  function creaOverlayLuminosita(scene, depth = 240) {
    scene.luminositaOverlay = scene.add.rectangle(0, 0, W, H, 0x000000, 0)
      .setOrigin(0).setDepth(depth);
    scene.luceOverlay = scene.add.rectangle(0, 0, W, H, 0xfff0bd, 0)
      .setOrigin(0).setDepth(depth + 1).setBlendMode(Phaser.BlendModes.ADD);
    aggiornaOverlayLuminosita(scene);
  }

  function aggiornaOverlayLuminosita(scene) {
    if (!scene.luminositaOverlay || !scene.luceOverlay) return;
    const b = clamp(impostazioni.luminosita, 0.65, 1.25);
    scene.luminositaOverlay.setAlpha(b < 1 ? (1 - b) * 0.75 : 0);
    scene.luceOverlay.setAlpha(b > 1 ? Math.min(0.18, (b - 1) * 0.52) : 0);
  }

  /* ════════════════════════════════════════════════
     SCENA PRINCIPALE
  ════════════════════════════════════════════════ */
  class MenuScena extends Phaser.Scene {
    constructor() {
      super("Menu");
    }

    preload() {
      this.load.image("menu_inizio", "assets/gioco/menu/schermata_inizio.png");
      if (!this.cache.audio.exists("musica_chill")) {
        this.load.audio("musica_chill",  "assets/gioco/audio/background_chill.mp3");
        this.load.audio("ambiente_molo", "assets/gioco/audio/wharf_ambience.mp3");
        this.load.audio("acqua_loop",    "assets/gioco/audio/flowing_water.mp3");
        this.load.audio("splash_sfx",    "assets/gioco/audio/fish_splash.mp3");
        this.load.audio("reel_sfx",      "assets/gioco/audio/reel_running.mp3");
      }

      const bg = this.add.rectangle(W / 2, H / 2, 620, 22, 0x0d1828, 0.95)
        .setStrokeStyle(2, 0xf6d36b);
      const bar = this.add.rectangle(W / 2 - 306, H / 2, 0, 14, 0xf6d36b, 1)
        .setOrigin(0, 0.5);
      this.add.text(W / 2, H / 2 - 42, "Caricamento...", {
        fontFamily: "monospace", fontSize: 22, color: "#fff",
        stroke: "#000", strokeThickness: 5
      }).setOrigin(0.5);
      this.load.on("progress", (v) => bar.setSize(612 * v, 14));
      this.load.on("complete", () => {
        bg.destroy();
        bar.destroy();
      });
    }

    create() {
      this.fase = 0;
      this.pannello = null;
      this.bottoniMenu = [];

      this.add.image(W / 2, H / 2, "menu_inizio")
        .setDisplaySize(W, H)
        .setDepth(0);

      this.menuFx = this.add.graphics().setDepth(4);
      this.add.rectangle(0, 0, W, H, 0x07121e, 0.08).setOrigin(0).setDepth(1);

      this.creaHotspotMenu(W / 2, 362, 320, 82, () => this.gioca());
      this.creaHotspotMenu(W / 2, 481, 320, 82, () => this.esci());
      this.creaHotspotMenu(W / 2, 600, 320, 78, () => this.apriImpostazioni());

      creaOverlayLuminosita(this, 230);
      this.avviaAudio(false);

      this.input.once("pointerdown", () => this.avviaAudio(false));
      this.input.keyboard.once("keydown", () => this.avviaAudio(false));
      this.input.keyboard.on("keydown-ENTER", () => this.gioca());
      this.input.keyboard.on("keydown-SPACE", () => this.gioca());
      this.input.keyboard.on("keydown-ESC", () => {
        if (this.pannello) this.chiudiImpostazioni();
      });
    }

    update(_, dtMs) {
      const dt = dtMs / 1000;
      this.fase += dt;
      this.menuFx.clear();

      for (let i = 0; i < 18; i += 1) {
        const x = (i * 83 + this.fase * 26) % (W + 140) - 70;
        const y = 55 + Math.sin(this.fase * 0.7 + i) * 20 + (i % 5) * 34;
        this.menuFx.lineStyle(2, 0xffffff, 0.08);
        this.menuFx.lineBetween(x - 42, y, x + 44, y + 8);
      }

      for (let i = 0; i < 9; i += 1) {
        const r = 16 + ((this.fase * 22 + i * 17) % 58);
        const alpha = 0.16 * (1 - (r - 16) / 58);
        const x = 105 + i * 132 + Math.sin(this.fase + i) * 10;
        const y = 507 + (i % 3) * 34;
        this.menuFx.lineStyle(2, 0xdaf8ff, alpha);
        this.menuFx.strokeCircle(x, y, r);
      }

      this.bottoniMenu.forEach((b, i) => {
        if (!b.hover) b.glow.setAlpha(0.04 + Math.sin(this.fase * 2.1 + i) * 0.018);
      });
    }

    avviaAudio(manuale = false) {
      const ok = avviaAudioGlobale(this, manuale);
      applicaVolumi(this);
      return ok;
    }

    creaHotspotMenu(x, y, w, h, cb) {
      const glow = this.add.rectangle(x, y, w, h, 0xffdf7a, 0.04)
        .setDepth(5).setStrokeStyle(3, 0xfff0bd, 0.18);
      const zona = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
      const voce = { glow, hover: false };
      this.bottoniMenu.push(voce);

      zona.on("pointerover", () => {
        voce.hover = true;
        glow.setAlpha(0.2).setStrokeStyle(3, 0xffffff, 0.72);
      });
      zona.on("pointerout", () => {
        voce.hover = false;
        glow.setAlpha(0.04).setStrokeStyle(3, 0xfff0bd, 0.18);
      });
      zona.on("pointerdown", () => {
        if (this.pannello) return;
        this.avviaAudio(true);
        cb();
      });
    }

    gioca() {
      if (this.pannello) return;
      this.avviaAudio(true);
      this.cameras.main.fadeOut(360, 0, 0, 0);
      this.time.delayedCall(380, () => this.scene.start("Gioco"));
    }

    esci() {
      if (this.pannello) return;
      this.avviaAudio(true);
      this.cameras.main.fadeOut(280, 0, 0, 0);
      this.time.delayedCall(320, () => {
        window.close();
        window.location.href = "about:blank";
      });
    }

    apriImpostazioni() {
      if (this.pannello) return;
      const c = this.add.container(0, 0).setDepth(260);
      this.pannello = c;

      c.add(this.add.rectangle(0, 0, W, H, 0x020713, 0.58).setOrigin(0).setInteractive());
      c.add(this.add.rectangle(W / 2 + 6, H / 2 + 10, 660, 470, 0x000000, 0.28));
      c.add(this.add.rectangle(W / 2, H / 2, 660, 470, 0x10131a, 0.96)
        .setStrokeStyle(3, 0xf3bc62, 0.95));
      c.add(this.add.rectangle(W / 2, 148, 660, 70, 0x5e3218, 0.96)
        .setStrokeStyle(2, 0xf6d36b, 0.85));
      c.add(this.add.text(W / 2, 147, "IMPOSTAZIONI", {
        fontFamily: "monospace", fontSize: 32, color: "#fff7db",
        stroke: "#000", strokeThickness: 6
      }).setOrigin(0.5));

      this.slider(c, 392, 230, "LUMINOSITA", 0.65, 1.25, impostazioni.luminosita, (v) => {
        impostazioni.luminosita = v;
        salvaImpostazioni();
        aggiornaOverlayLuminosita(this);
      });
      this.slider(c, 392, 318, "MUSICA", 0, 1, impostazioni.volumeMusica, (v) => {
        impostazioni.volumeMusica = v;
        salvaImpostazioni();
        applicaVolumi(this);
      });
      this.slider(c, 392, 406, "EFFETTI", 0, 1, impostazioni.volumeEffetti, (v) => {
        impostazioni.volumeEffetti = v;
        salvaImpostazioni();
      });

      this.bottone(c, 392, 505, 178, 48, impostazioni.muto ? "AUDIO OFF" : "AUDIO ON", () => {
        impostazioni.muto = !impostazioni.muto;
        salvaImpostazioni();
        applicaVolumi(this);
        if (!impostazioni.muto) this.avviaAudio(true);
        this.chiudiImpostazioni();
        this.time.delayedCall(90, () => this.apriImpostazioni());
      }, 17);
      this.bottone(c, 606, 505, 250, 48, "TORNA", () => this.chiudiImpostazioni(), 18);
      this.bottone(c, 915, 132, 42, 42, "X", () => this.chiudiImpostazioni(), 21);
    }

    slider(parent, x, y, label, min, max, value, onChange) {
      const width = 430;
      const pct = () => (value - min) / (max - min);
      const title = this.add.text(x, y - 28, label, {
        fontFamily: "monospace", fontSize: 17, color: "#ffe3a0",
        stroke: "#000", strokeThickness: 4
      });
      const valoreTxt = this.add.text(x + width, y - 28, "", {
        fontFamily: "monospace", fontSize: 17, color: "#ffffff",
        stroke: "#000", strokeThickness: 4
      }).setOrigin(1, 0);
      const barBg = this.add.rectangle(x, y, width, 10, 0x3a2417, 1)
        .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      const bar = this.add.rectangle(x, y, width * pct(), 10, 0xf6d36b, 1)
        .setOrigin(0, 0.5);
      const knob = this.add.circle(x + width * pct(), y, 16, 0xfff2c2, 1)
        .setStrokeStyle(3, 0x4a2412).setInteractive({ useHandCursor: true, draggable: true });
      parent.add([title, valoreTxt, barBg, bar, knob]);
      this.input.setDraggable(knob);

      const aggiorna = (worldX) => {
        const p = clamp((worldX - x) / width, 0, 1);
        value = min + p * (max - min);
        bar.setSize(width * p, 10);
        knob.setX(x + width * p);
        valoreTxt.setText(`${Math.round(value * 100)}%`);
        onChange(value);
      };

      aggiorna(x + width * pct());
      barBg.on("pointerdown", (pointer) => aggiorna(pointer.x));
      knob.on("drag", (pointer) => aggiorna(pointer.x));
    }

    bottone(parent, x, y, w, h, t, cb, fs = 16) {
      const c = this.add.container(x, y);
      const ombra = this.add.rectangle(5, 7, w, h, 0x000000, 0.28).setOrigin(0);
      const r = this.add.rectangle(0, 0, w, h, 0x8d4b22, 0.98)
        .setOrigin(0).setStrokeStyle(2, 0xf6d36b, 0.9)
        .setInteractive({ useHandCursor: true });
      const hi = this.add.rectangle(4, 4, w - 8, 8, 0xffd890, 0.25).setOrigin(0);
      const tx = this.add.text(w / 2, h / 2, t, {
        fontFamily: "monospace", fontSize: fs, color: "#fff",
        stroke: "#000", strokeThickness: 5
      }).setOrigin(0.5);
      r.on("pointerover", () => r.setFillStyle(0xb86528, 1));
      r.on("pointerout", () => r.setFillStyle(0x8d4b22, 0.98));
      r.on("pointerdown", cb);
      c.add([ombra, r, hi, tx]);
      parent.add(c);
      return c;
    }

    chiudiImpostazioni() {
      if (!this.pannello) return;
      this.pannello.destroy();
      this.pannello = null;
      aggiornaOverlayLuminosita(this);
    }
  }

  class Scena extends Phaser.Scene {
    constructor() {
      super("Gioco");
    }

    /* ── preload ── */
    preload() {
      /* sprite pescatore (spritesheet da assets reali) */
      this.load.spritesheet("pescatore_fermo",   "assets/gioco/personaggi/pescatore_idle.png",    { frameWidth: 48, frameHeight: 48 });
      this.load.spritesheet("pescatore_cammina", "assets/gioco/personaggi/pescatore_cammina.png", { frameWidth: 48, frameHeight: 48 });
      this.load.spritesheet("pescatore_pesca",   "assets/gioco/personaggi/pescatore_pesca.png",   { frameWidth: 48, frameHeight: 48 });
      this.load.spritesheet("pescatore_amo",     "assets/gioco/personaggi/pescatore_amo.png",     { frameWidth: 48, frameHeight: 48 });

      /* oggetti scena */
      this.load.image("pontile_asset", "assets/gioco/oggetti/pontile.png");
      this.load.image("acqua_asset",   "assets/gioco/oggetti/acqua.png");
      this.load.image("barca_asset",   "assets/gioco/oggetti/barca.png");
      this.load.image("capanna_asset", "assets/gioco/oggetti/capanna.png");
      this.load.image("erba_1_asset",  "assets/gioco/oggetti/erba_1.png");
      this.load.image("erba_2_asset",  "assets/gioco/oggetti/erba_2.png");
      this.load.spritesheet("pesci_extra_sheet", "assets/gioco/pesci_extra/fish_sprite_sheet_32.png", {
        frameWidth: 32,
        frameHeight: 32
      });

      if (!this.cache.audio.exists("musica_chill")) {
        this.load.audio("musica_chill",  "assets/gioco/audio/background_chill.mp3");
        this.load.audio("ambiente_molo", "assets/gioco/audio/wharf_ambience.mp3");
        this.load.audio("acqua_loop",    "assets/gioco/audio/flowing_water.mp3");
        this.load.audio("splash_sfx",    "assets/gioco/audio/fish_splash.mp3");
        this.load.audio("reel_sfx",      "assets/gioco/audio/reel_running.mp3");
      }

      /* sfondi luoghi */
      this.load.image("fondale_asset",  "assets/gioco/luoghi/fondale.png");
      luoghi.forEach((_, i) =>
        this.load.image(`sfondo_luogo_${i}`, `assets/gioco/luoghi/luogo-${i + 1}.png`)
      );

      /* pesci – prima SVG (sicuro), poi tentiamo PNG reale */
      pesci.forEach((p) => {
        this.load.image(chiavePesce(p.id), `assets/gioco/pesci/pesce-${filePesce(p.id)}.png`);
      });

      /* barra caricamento */
      const bar = this.add.rectangle(W / 2, H / 2, 0, 16, 0xba7517);
      const bg  = this.add.rectangle(W / 2, H / 2, 600, 20, 0x0d1828).setStrokeStyle(2, 0x6ca9ce);
      const lbl = this.add.text(W / 2, H / 2 - 36, "Caricamento asset...",
        { fontFamily: "monospace", fontSize: 20, color: "#fff" }).setOrigin(0.5);
      this.load.on("progress", (v) => bar.setSize(v * 600, 16));
      this.load.on("complete", () => { bar.destroy(); bg.destroy(); lbl.destroy(); });
    }

    /* ── create ── */
    create() {
      const salvato = JSON.parse(localStorage.getItem(CHIAVE) || "{}");
      this.s = {
        monete:         salvato.monete         || 0,
        scoperte:       salvato.scoperte       || [],
        luogo:          salvato.luogo          || "molo",
        x:              salvato.x              || 190,
        catture:        salvato.catture        || 0,
        tempo:          salvato.tempo          || 0,
        comprati:       salvato.comprati       || [],
        luoghiSbloccati: salvato.luoghiSbloccati || ["molo"],
        canna:          salvato.canna          || "",
        esca:           salvato.esca           || "",
        registro:       salvato.registro       || []
      };

      this.stato        = "pronto";
      this.amo          = { x: this.s.x + AMO_X_OFFSET, y: AMO_PRONTO_Y, onda: 0 };
      this.meteoIdx     = 0;
      this.timerMeteo   = 90;
      this.timerSalva   = 0;
      this.pannello     = null;
      this._cast        = null;
      this._profonditaPrevista = null;
      this.pesceMorsoSpr = null;

      this.g  = this.add.graphics();
      this.fx = this.add.graphics().setDepth(6);
      this.screenFx = this.add.graphics().setDepth(59);

      /* sfondi e decorazioni */
      this.sfondoLuogo = this.add.image(W / 2, ACQUA / 2, "sfondo_luogo_0")
        .setDisplaySize(W, ACQUA).setDepth(1).setAlpha(0.38);

      this.fondaleAsset = this.add.image(W / 2, H - 150, "fondale_asset")
        .setDisplaySize(W, 330).setDepth(1.5).setAlpha(0.2);

      this.acquaTessuto = this.add.tileSprite(W / 2, ACQUA + 118, W, 236, "acqua_asset")
        .setDepth(2).setAlpha(0.18);

      this.pontileAsset = this.add.tileSprite(240, ACQUA - 27, 480, 72, "pontile_asset")
        .setDepth(7);

      this.capannaAsset = this.add.image(26, ACQUA - 37, "capanna_asset")
        .setOrigin(0, 1).setDisplaySize(170, 130).setDepth(7);

      this.barcaAsset = this.add.image(590, ACQUA - 20, "barca_asset")
        .setOrigin(0.5, 1).setDisplaySize(160, 75).setDepth(5).setAlpha(0.9);

      this.erbaAsset1 = this.add.image(210, ACQUA - 38, "erba_1_asset")
        .setOrigin(0.5, 1).setScale(2.4).setDepth(7);

      this.erbaAsset2 = this.add.image(382, ACQUA - 38, "erba_2_asset")
        .setOrigin(0.5, 1).setScale(2.4).setDepth(7);

      /* stelle, alghe, bolle */
      this.stelle = Array.from({ length: 100 }, () => ({
        x: Phaser.Math.Between(0, W),
        y: Phaser.Math.Between(10, 230),
        f: Math.random() * 6,
        r: Math.random() * 2 + 0.7
      }));

      this.alghe = Array.from({ length: 78 }, () => ({
        x: Phaser.Math.Between(250, W - 20),
        z: Phaser.Math.Between(1, 5),
        h: Phaser.Math.Between(18, 64),
        f: Math.random() * 6
      }));

      this.bolle = Array.from({ length: 42 }, () => ({
        x: Phaser.Math.Between(260, W),
        y: Phaser.Math.Between(ACQUA + 20, H + 80),
        r: Math.random() * 3 + 1,
        v: Math.random() * 20 + 12
      }));

      /* pesci decorativi in background */
      this.sfondoPesci = Array.from({ length: 24 }, () => ({
        spr: this.add.image(0, 0, chiavePesce(Phaser.Math.Between(1, 112)))
          .setDisplaySize(Phaser.Math.Between(42, 86), Phaser.Math.Between(24, 48))
          .setAlpha(0.25).setDepth(3).setTint(0x18324a),
        x: Phaser.Math.Between(260, W),
        y: Phaser.Math.Between(ACQUA + 30, H - 40),
        v: Phaser.Math.Between(12, 36),
        d: Math.random() > 0.5 ? 1 : -1
      }));

      this.sfondoPesciExtra = Array.from({ length: 30 }, () => {
        const row = Phaser.Math.Between(0, 23);
        const baseCol = Phaser.Math.Between(0, 3) * 4;
        const scala = Phaser.Math.FloatBetween(1.6, 2.8);
        return {
          spr: this.add.sprite(0, 0, "pesci_extra_sheet", row * 16 + baseCol)
            .setScale(scala).setAlpha(Phaser.Math.FloatBetween(0.36, 0.78)).setDepth(4),
          row,
          baseCol,
          x: Phaser.Math.Between(250, W + 120),
          baseY: Phaser.Math.Between(ACQUA + 30, H - 48),
          v: Phaser.Math.Between(18, 58),
          d: Math.random() > 0.5 ? 1 : -1,
          phase: Math.random() * 10,
          freq: Phaser.Math.FloatBetween(1.2, 2.8),
          amp: Phaser.Math.FloatBetween(5, 18)
        };
      });

      /* animazioni */
      this.creaAnimazioni();

      /* pescatore sprite */
      this.pescatore = this.add.sprite(this.s.x, ACQUA - 38, "pescatore_fermo")
        .setOrigin(0.5, 1).setScale(3).setDepth(8);
      this.pescatore.play("pescatore_fermo_anim");

      /* UI */
      this.creaUi();
      this.creaAudio();
      creaOverlayLuminosita(this, 240);

      /* input tastiera */
      this.keys = this.input.keyboard.addKeys({
        sx:  "A", dx:  "D",
        fsx: "LEFT", fdx: "RIGHT",
        sp:  "SPACE", m: "M", l: "L", n: "S", i: "I"
      });
      this.keys.sp.on("down", () => this.iniziaCarica());
      this.keys.sp.on("up",   () => this.rilasciaLancio());
      this.keys.m.on("down",  () => this.museo());
      this.keys.l.on("down",  () => this.luoghi());
      this.keys.n.on("down",  () => this.negozio());
      this.keys.i.on("down",  () => this.pannello ? this.chiudi() : this.apriImpostazioni());
      this.input.keyboard.on("keydown", () => this.avviaAudio());

      this.toast("Bentornato, Pescatore!");
    }

    /* ── UI ── */
    creaUi() {
      this.add.rectangle(18, 14, 428, 72, 0x06101a, 0.72)
        .setOrigin(0).setDepth(58).setStrokeStyle(1, 0x3a6f8d, 0.72);
      this.add.rectangle(W / 2 - 80, 14, 160, 48, 0x06101a, 0.66)
        .setOrigin(0).setDepth(58).setStrokeStyle(1, 0xf6d36b, 0.6);
      this.add.rectangle(730, 10, 534, 48, 0x06101a, 0.62)
        .setOrigin(0).setDepth(58).setStrokeStyle(1, 0x355773, 0.72);
      this.add.rectangle(18, 574, 430, 90, 0x06101a, 0.7)
        .setOrigin(0).setDepth(58).setStrokeStyle(1, 0x3a6f8d, 0.7);
      this.add.rectangle(W / 2 - 170, H - 94, 340, 82, 0x06101a, 0.58)
        .setOrigin(0).setDepth(58).setStrokeStyle(1, 0xf6d36b, 0.48);

      this.testo = this.add.text(30, 24, "", {
        fontFamily: "monospace", fontSize: 16, color: "#fff",
        stroke: "#000", strokeThickness: 4
      }).setDepth(60);

      this.orologio = this.add.text(W / 2, 38, "", {
        fontFamily: "monospace", fontSize: 30, color: "#FFEFB5",
        stroke: "#000", strokeThickness: 6
      }).setOrigin(0.5).setDepth(60);

      this.meteoTxt = this.add.text(30, 52, "", {
        fontFamily: "monospace", fontSize: 15, color: "#CFFFE2",
        stroke: "#000", strokeThickness: 4
      }).setDepth(60);

      this.luogoTxt = this.add.text(36, 592, "", {
        fontFamily: "monospace", fontSize: 16, color: "#CFFFE2",
        stroke: "#000", strokeThickness: 5
      }).setDepth(60);

      this.zonaTxt = this.add.text(36, 622, "", {
        fontFamily: "monospace", fontSize: 16, color: "#E9F6FF",
        stroke: "#000", strokeThickness: 5
      }).setDepth(60);

      this.profTxt = this.add.text(1174, 280, "", {
        fontFamily: "monospace", fontSize: 16, color: "#E9F6FF",
        align: "right", stroke: "#000", strokeThickness: 5
      }).setOrigin(1, 0).setDepth(60);

      this.registroTxt = this.add.text(30, 98, "", {
        fontFamily: "monospace", fontSize: 13, color: "#F5F0DC",
        backgroundColor: "#06101acc",
        padding: { x: 8, y: 6 }
      }).setDepth(60);

      /* bottoni fissi */
      this.btnLancio = this.btn(W / 2 - 145, H - 82, 290, 52, "LANCIA", () => this.iniziaCarica(), 24);
      this.btnLancio.hit.on("pointerup",  () => this.rilasciaLancio());
      this.btnLancio.hit.on("pointerout", () => this.rilasciaLancio());
      /* hint controlli */
      this.add.text(W / 2, H - 26, "SPAZIO: tieni premuto e rilascia", {
        fontFamily: "monospace", fontSize: 12, color: "#8fa8bf", stroke: "#000", strokeThickness: 3
      }).setOrigin(0.5).setDepth(60);
      this.btnMuseo   = this.btn(746, 16, 100, 34,  "MUSEO",   () => this.museo(), 13);
      this.btnLuoghi  = this.btn(858, 16, 114, 34,  "LUOGHI",  () => this.luoghi(), 13);
      this.btnNegozio = this.btn(984, 16, 124, 34, "NEGOZIO", () => this.negozio(), 13);
      this.btnImpost  = this.btn(1120, 16, 128, 34, "IMPOST.", () => this.apriImpostazioni(), 13);
      this.btnsNav = [this.btnMuseo, this.btnLuoghi, this.btnNegozio, this.btnImpost];
    }

    creaAudio() {
      this.audioAvviato = !!this.game.registry.get("audioAvviato");
      this.tracce = preparaAudio(this);
    }

    avviaAudio(manuale = false) {
      if (impostazioni.muto && !manuale) return;
      avviaAudioGlobale(this, manuale);
      this.audioAvviato = !!this.game.registry.get("audioAvviato");
      if (manuale) this.toast("Audio attivo");
    }

    suonaAudio(key, cfg = {}) {
      if (!this.audioAvviato || impostazioni.muto) return;
      const volume = (cfg.volume ?? 1) * impostazioni.volumeEffetti;
      this.sound.play(key, { ...cfg, volume });
    }

    /* ── getter comodi ── */
    luogo()       { return luoghi.find((l) => l.id === this.s.luogo) || luoghi[0]; }
    meteoOra()    { return meteo[this.meteoIdx]; }
    raritaIndice(r) { return ordine.indexOf(r); }
    indiceLuogo() { return Math.max(0, luoghi.findIndex((l) => l.id === this.s.luogo)); }
    statCanna() { return negozio.find((n) => n.id === this.s.canna) || cannaBase; }

    finestra() {
      return (this.statCanna().finestra || cannaBase.finestra) * (this.meteoOra().finestra || 1);
    }

    puntoCanna() {
      const tensione = this._lenzaTensione || 1;
      const tremolo = this._cannaTremolo || 0;
      const carica = this.stato === "carica"
        ? Phaser.Math.Clamp((this._caricaTimer || 0) / 1.8, 0, 1)
        : 0;
      const piega = (this.stato === "morso" ? 10 * tensione : 0) + carica * 5;
      return {
        x: this.s.x + 66 + carica * 8,
        y: ACQUA - 111 + tremolo + piega
      };
    }

    /* ── animazioni pescatore ── */
    creaAnimazioni() {
      if (this.anims.exists("pescatore_fermo_anim")) return;

      this.anims.create({
        key: "pescatore_fermo_anim",
        frames: this.anims.generateFrameNumbers("pescatore_fermo", { start: 0, end: 3 }),
        frameRate: 4, repeat: -1
      });
      this.anims.create({
        key: "pescatore_cammina_anim",
        frames: this.anims.generateFrameNumbers("pescatore_cammina", { start: 0, end: 5 }),
        frameRate: 9, repeat: -1
      });
      this.anims.create({
        key: "pescatore_pesca_anim",
        frames: this.anims.generateFrameNumbers("pescatore_pesca", { start: 0, end: 3 }),
        frameRate: 6, repeat: -1
      });
      this.anims.create({
        key: "pescatore_amo_anim",
        frames: this.anims.generateFrameNumbers("pescatore_amo", { start: 0, end: 5 }),
        frameRate: 8, repeat: 0
      });
    }

    animaPescatore(nome) {
      if (!this.pescatore) return;
      if (this.pescatore.anims.currentAnim?.key === nome) return;
      this.pescatore.play(nome, true);
    }

    /* ── update loop ── */
    update(_, dtMs) {
      const dt = dtMs / 1000;
      this.s.tempo  += dt;
      this.timerSalva  += dt;
      this.timerMeteo  -= dt;

      if (this.timerMeteo <= 0) {
        this.timerMeteo = 90;
        this.meteoIdx   = Phaser.Math.Between(0, meteo.length - 1);
        this.toast(`Meteo: ${this.meteoOra().nome}`);
      }

      this.muovi(dt);
      this.pesca(dt);
      this.disegna(dt);
      this.aggiornaUi();

      if (this.timerSalva >= 7) {
        this.timerSalva = 0;
        this.salva();
      }
    }

    aggiornaUi() {
      const ora = Math.floor((this.s.tempo / 180) * 24 * 60) % 1440;
      const hh  = String(Math.floor(ora / 60)).padStart(2, "0");
      const mm  = String(ora % 60).padStart(2, "0");
      this.orologio.setText(`${hh}:${mm}`);
      this.testo.setText(
        `Monete ${this.s.monete}   Museo ${this.s.scoperte.length}/112   Catture ${this.s.catture}`
      );
      this.meteoTxt.setText(
        `${this.meteoOra().icona} ${this.meteoOra().nome}  (cambio tra ${Math.ceil(this.timerMeteo)}s)`
      );
      this.registroTxt.setText(
        ["REGISTRO", ...this.s.registro.slice(0, 8).map((r) => `${r.nome}  +${r.valore}`)].join("\n")
      );
    }

    /* ── movimento pescatore (con accelerazione/decelerazione) ── */
    muovi(dt) {
      if (this.pannello) return;
      /* inizializza velocità se non esiste */
      if (this._velX === undefined) this._velX = 0;
      if (this._idlePhase === undefined) this._idlePhase = 0;

      const inPesca = this.stato !== "pronto";

      const d = (
        (this.keys.dx.isDown || this.keys.fdx.isDown) ? 1 : 0
      ) - (
        (this.keys.sx.isDown || this.keys.fsx.isDown) ? 1 : 0
      );

      const VMAX = 190;
      const ACCEL = 620;
      const DECEL = 480;

      if (d !== 0 && !inPesca) {
        /* accelerazione */
        this._velX += d * ACCEL * dt;
        this._velX = Phaser.Math.Clamp(this._velX, -VMAX, VMAX);
        this.pescatore.setFlipX(d < 0);
        this.animaPescatore("pescatore_cammina_anim");
      } else {
        /* decelerazione */
        const segno = Math.sign(this._velX);
        const fren  = DECEL * dt;
        if (Math.abs(this._velX) <= fren) {
          this._velX = 0;
        } else {
          this._velX -= segno * fren;
        }
        if (this._velX === 0) {
          this.animaPescatore(inPesca ? "pescatore_pesca_anim" : "pescatore_fermo_anim");
        }
      }

      /* micro-controllo dell'amo mentre scende */
      if (inPesca && d !== 0 && this.stato === "lancio" && this._cast?.phase === "discesa") {
        this._cast.drift = Phaser.Math.Clamp((this._cast.drift || 0) + d * 70 * dt, -85, 85);
      }

      /* movimento normale */
      if (!inPesca && this._velX !== 0) {
        const lim  = this.luogo().lim;
        this.s.x   = Phaser.Math.Clamp(this.s.x + this._velX * dt, lim[0], lim[1]);
        this.amo.x = this.s.x + AMO_X_OFFSET;
      }

      /* idle oscillazione verticale */
      if (this._velX === 0 && !inPesca) {
        this._idlePhase += dt * 2.2;
        const bob = Math.sin(this._idlePhase) * 1.4;
        this.pescatore.setY(ACQUA - 38 + bob);
      }
    }

    /* ── logica pesca ── */
    pesca(dt) {
      /* fase di carica (hold) */
      if (this.stato === "carica") {
        this._caricaTimer = (this._caricaTimer || 0) + dt;
        /* oscillazione canna durante carica */
        this._cannaTremolo = Math.sin(this._caricaTimer * 14) * (2 + this._caricaTimer * 1.5);
        this._profonditaPrevista = this.calcolaProfonditaStimata(
          Phaser.Math.Clamp(this._caricaTimer / 1.8, 0.04, 1)
        );
        const punta = this.puntoCanna();
        this.amo.x = punta.x;
        this.amo.y = punta.y + 10;
        if (this._caricaTimer >= 1.8) this.rilasciaLancio();
        return;
      }

      if (this.stato === "lancio") {
        const cast = this._cast;
        if (cast?.phase === "aria") {
          cast.t = Math.min(1, cast.t + dt / cast.dur);
          const e = 1 - Math.pow(1 - cast.t, 2);
          const arco = Math.sin(cast.t * Math.PI) * (76 + cast.forza * 74);
          this.amo.x = Phaser.Math.Linear(cast.startX, cast.waterX, e);
          this.amo.y = Phaser.Math.Linear(cast.startY, cast.waterY, e) - arco;
          this._cannaTremolo = Math.sin(this.s.tempo * 20) * (2 + cast.forza * 4);
          if (cast.t >= 1) {
            cast.phase = "discesa";
            this.amo.x = cast.waterX;
            this.amo.y = AMO_Y_MIN;
            this._amoVy = cast.sink;
            this.splash(this.amo.x, ACQUA + 6, col("#A9DBFF"));
            this.suonaAudio("splash_sfx", { volume: 0.42, rate: 0.96 + cast.forza * 0.18 });
          }
          return;
        }

        const target = this._amoTargetY || AMO_Y_MAX;
        const zona = Phaser.Math.Clamp(Math.floor((this.amo.y - ACQUA) / ALTEZZA_ZONA), 0, 5);
        const corrente = Math.sin(this.s.tempo * 1.7 + this.amo.y * 0.03) * (8 + zona * 3);
        const baseX = cast?.waterX || (this.s.x + AMO_X_OFFSET);
        const targetX = Phaser.Math.Clamp(baseX + (cast?.drift || 0) + corrente, 12, W - 12);

        this._amoVy = Math.min((this._amoVy || 96) + 34 * dt, cast?.sink || 190);
        this.amo.x += (targetX - this.amo.x) * Math.min(1, dt * 2.7);
        const prossimoY = this.amo.y + this._amoVy * dt;
        if (prossimoY >= target) {
          this.amo.y = target;
          this._amoArrivato = true;
        } else {
          this.amo.y = Phaser.Math.Clamp(prossimoY, AMO_Y_MIN, AMO_Y_MAX);
        }
        this.amo.x = Phaser.Math.Clamp(this.amo.x, 12, W - 12);
        this.amo.y = Phaser.Math.Clamp(this.amo.y, AMO_Y_MIN, AMO_Y_MAX);
        this._cannaTremolo = Math.sin(this.s.tempo * 12) * 1.8;

        this.tMorso -= dt * this.meteoOra().morso;
        if (this.tMorso <= 0 || (this._amoArrivato && this.tMorso <= 0.55)) {
          this.stato         = "morso";
          this.tempoFinestra = this.finestra();
          this._cannaTremolo = 0;
          this.pesce         = this.scegliPesce(this.amo.y);
          this.mostraPesceAgganciato(this.pesce);
          this.suonaAudio("reel_sfx", { volume: 0.2, rate: 0.82 });
          this.morso = this.add.text(
            this.amo.x, this.amo.y - 55, "!!!",
            { fontFamily: "monospace", fontSize: 38, color: "#fff", stroke: "#000", strokeThickness: 7 }
          ).setOrigin(0.5).setDepth(70);
        }
      }

      if (this.stato === "morso") {
        this.tempoFinestra -= dt;
        /* oscillazione canna durante tiro */
        this._cannaTremolo = Math.sin(this.s.tempo * 9) * 3.5;
        /* tensione lenza visiva: la lenza si "tende" verso il basso */
        this._lenzaTensione = 1 + (1 - this.tempoFinestra / this.finestra()) * 0.6;
        if (this.morso) {
          this.morso.setPosition(
            this.amo.x + Math.sin(Date.now() / 30) * 8,
            this.amo.y - 55
          );
        }
        if (this.pesceMorsoSpr) {
          const fase = this.s.tempo * 8;
          const frame = this._pesceMorsoBase + (Math.floor(fase) % 4);
          this.pesceMorsoSpr
            .setFrame(frame)
            .setPosition(this.amo.x + Math.sin(fase) * 34, this.amo.y + 14 + Math.cos(fase * 0.7) * 10)
            .setFlipX(Math.sin(fase) < 0)
            .setRotation(Math.sin(fase * 0.8) * 0.16);
        }
        if (this.tempoFinestra <= 0) this.manca();
      } else {
        /* lenza rilassata */
        this._lenzaTensione = this._lenzaTensione
          ? Math.max(1, this._lenzaTensione - dt * 2)
          : 1;
      }
    }

    iniziaCarica() {
      if (this.pannello) return;
      this.avviaAudio();
      if (this.stato === "morso") {
        this.cattura();
        return;
      }
      if (this.stato !== "pronto") return;

      this.stato         = "carica";
      this._caricaTimer  = 0;
      this._cannaTremolo = 0;
      this._amoTargetY   = AMO_Y_MIN;
      this._profonditaPrevista = this.calcolaProfonditaStimata(0.04);
      this._cast         = null;
      const punta        = this.puntoCanna();
      this.amo.x         = punta.x;
      this.amo.y         = punta.y + 10;
      this.animaPescatore("pescatore_amo_anim");
    }

    rilasciaLancio() {
      if (this.pannello || this.stato !== "carica") return;

      const carica    = Phaser.Math.Clamp(this._caricaTimer || 0, 0.08, 1.8);
      const forzaNorm = Phaser.Math.Clamp(carica / 1.8, 0.04, 1);
      const target    = this.calcolaProfonditaTarget(forzaNorm);
      const distanza  = Math.max(20, target - AMO_Y_MIN);
      const stats     = this.statCanna();
      const punta     = this.puntoCanna();
      const startX    = punta.x;
      const startY    = punta.y;
      const waterX    = Phaser.Math.Clamp(this.s.x + 86 + forzaNorm * 150, 24, W - 24);

      this.stato        = "lancio";
      this.amo.x        = startX;
      this.amo.y        = startY;
      this._amoTargetY  = target;
      this._profonditaPrevista = target;
      this._amoVy       = 72 + forzaNorm * 54;
      this._amoArrivato = false;
      this.tMorso       = Phaser.Math.FloatBetween(2.0, 4.6) + distanza / 145;
      this.pesce        = null;
      this._cast        = {
        phase: "aria",
        t: 0,
        dur: Phaser.Math.Clamp(0.48 - forzaNorm * 0.12, 0.30, 0.48),
        startX,
        startY,
        waterX,
        waterY: AMO_Y_MIN,
        targetY: target,
        forza: forzaNorm,
        drift: 0,
        sink: 132 + forzaNorm * 76 + (stats.sink || 1) * 42 + (this.meteoOra().id === "marea" ? 28 : 0)
      };
      this.suonaAudio("reel_sfx", { volume: 0.34, rate: 0.92 + forzaNorm * 0.22 });
      this.pescatore.setFlipX(false);
    }

    calcolaProfonditaTarget(forzaNorm) {
      const stats = this.statCanna();
      const maxNorm = Phaser.Math.Clamp((stats.maxNorm || cannaBase.maxNorm) + (this.meteoOra().id === "marea" ? 0.08 : 0), 0.24, 0.99);
      const controllo = Phaser.Math.Clamp(stats.controllo || cannaBase.controllo, 0.45, 1.15);
      const power = Math.pow(forzaNorm, 1.28);
      const erroreAmp = Phaser.Math.Linear(0.13, 0.035, Phaser.Math.Clamp(controllo, 0, 1));
      const colpoFortunato = Math.random() < (stats.luck || cannaBase.luck);
      const errore = Phaser.Math.FloatBetween(-erroreAmp, erroreAmp * 0.55);
      const bonusFortuna = colpoFortunato ? Phaser.Math.FloatBetween(0.04, 0.11) : 0;
      const norm = Phaser.Math.Clamp(0.045 + power * (maxNorm - 0.045) + errore + bonusFortuna, 0.035, Math.min(1, maxNorm + bonusFortuna * 0.45));
      return Phaser.Math.Clamp(AMO_Y_MIN + norm * PROFONDITA_GIOCABILE, AMO_Y_MIN, AMO_Y_MAX);
    }

    calcolaProfonditaStimata(forzaNorm) {
      const stats = this.statCanna();
      const maxNorm = Phaser.Math.Clamp((stats.maxNorm || cannaBase.maxNorm) + (this.meteoOra().id === "marea" ? 0.08 : 0), 0.24, 0.99);
      const power = Math.pow(forzaNorm, 1.28);
      const norm = Phaser.Math.Clamp(0.045 + power * (maxNorm - 0.045), 0.035, maxNorm);
      return Phaser.Math.Clamp(AMO_Y_MIN + norm * PROFONDITA_GIOCABILE, AMO_Y_MIN, AMO_Y_MAX);
    }

    azione() {
      if (this.stato === "carica") this.rilasciaLancio();
      else this.iniziaCarica();
    }

    /* ── selezione pesce pesata con profondità bilanciata ── */
    scegliPesce(profTarget) {
      const stats = this.statCanna();
      const depthBonus = stats.depthBonus || 0;

      /* Calcola indice zona (0=superficie..5=baratro) */
      const zonaAmo = profTarget !== undefined
        ? Phaser.Math.Clamp(Math.floor((profTarget - ACQUA) / ALTEZZA_ZONA), 0, 5)
        : this._scegliZonaPesata(depthBonus);

      let lista = pesci.filter((p) => p.rarita !== "DIVINO" || (this.s.catture >= 60 && zonaAmo >= 5));

      if (this.meteoOra().id === "nebbia" && this.meteoOra().solo) {
        lista = lista.filter((p) => this.meteoOra().solo.includes(p.rarita));
      }

      if (
        this.s.comprati.includes("retino_fortuna") &&
        (this.s.catture + 1) % 10 === 0
      ) {
        const listaRara = lista.filter((p) => this.raritaIndice(p.rarita) >= this.raritaIndice("RARO"));
        if (listaRara.length) lista = listaRara;
      }

      /* Pesi profondità: zone alte danno probabilità maggiore a pesci rari */
      /* Ogni pesce ha un "livello minimo di zona" implicito nel suo blocco di rarità */
      const zonaMinRarita = { COMUNE: 0, INSOLITO: 0, RARO: 1, EPICO: 2, LEGGENDARIO: 3, ANTICO: 4, MITICO: 4, DIVINO: 5 };
      const zonePreferite = {
        COMUNE: [0, 1],
        INSOLITO: [0, 1, 2],
        RARO: [1, 2],
        EPICO: [2, 3],
        LEGGENDARIO: [3, 4],
        ANTICO: [4, 5],
        MITICO: [3, 4, 5],
        DIVINO: [5]
      };

      const gruppi = new Map();
      for (const p of lista) {
        if (!gruppi.has(p.rarita)) gruppi.set(p.rarita, []);
        gruppi.get(p.rarita).push(p);
      }

      let totale = 0;
      const righe = Array.from(gruppi.entries()).map(([r, gruppo]) => {
        const indice = this.raritaIndice(r);
        let peso = rarita[r][1];
        if (this.s.esca === "esca_brillante" && indice >= 1) peso *= 1.28;
        if (this.s.esca === "esca_profonda"  && indice >= 2) peso *= 1.65;
        if (this.luogo().id === "laguna"  && r === "INSOLITO") peso *= 1.12;
        if (this.luogo().id === "corallo" && indice >= 2)      peso *= 1.14;
        if (this.luogo().id === "rovine"  && indice >= 3)      peso *= 1.18;
        if (this.meteoOra().id === "temporale" && indice >= 3) peso *= 1.7;
        if (this.meteoOra().id === "marea" && indice >= 2)     peso *= 1.18;

        const zonaMin = zonaMinRarita[r] || 0;
        const preferite = zonePreferite[r] || [0, 1, 2, 3, 4, 5];
        if (preferite.includes(zonaAmo)) {
          peso *= 1.25 + zonaAmo * 0.08;
        } else {
          const distanza = Math.min(...preferite.map((z) => Math.abs(zonaAmo - z)));
          peso *= Math.max(0.015, 0.18 - distanza * 0.045);
        }

        if (zonaAmo >= zonaMin) {
          peso *= 1 + (zonaAmo - zonaMin) * (0.14 + depthBonus * 0.65);
        } else {
          peso *= Math.pow(0.018, zonaMin - zonaAmo);
        }

        if (indice >= 2) peso *= 1 + depthBonus * indice * 0.38;
        if (indice >= 4 && zonaAmo < 4) peso *= 0.02;
        if (r === "DIVINO" && (zonaAmo < 5 || this.s.catture < 60)) peso = 0;

        totale += peso;
        return { r, gruppo, peso };
      });

      if (totale <= 0 || !righe.length) {
        return Phaser.Utils.Array.GetRandom(pesci.filter((p) => p.rarita === "COMUNE"));
      }

      let tiro = Math.random() * totale;
      for (const riga of righe) {
        tiro -= riga.peso;
        if (tiro <= 0) {
          return Phaser.Utils.Array.GetRandom(riga.gruppo);
        }
      }
      return Phaser.Utils.Array.GetRandom(lista.filter((p) => p.rarita === "COMUNE")) || lista[0];
    }

    /* Sistema profondità bilanciato (quando non si usa lancio fisico) */
    _scegliZonaPesata(depthBonus) {
      /* Pesi base: superficie molto frequente, baratro rarissimo */
      const pesiZona = [58, 25, 11, 4, 1.6, 0.4];
      /* La canna sposta il peso verso le zone più profonde */
      const pesiMod = pesiZona.map((p, i) => {
        if (i === 0) return p * (1 - depthBonus * 0.55);
        return p * (1 + depthBonus * i * 0.35);
      });
      const tot = pesiMod.reduce((a, b) => a + b, 0);
      let r = Math.random() * tot;
      for (let i = 0; i < pesiMod.length; i++) {
        r -= pesiMod[i];
        if (r <= 0) return i;
      }
      return 0;
    }

    valore(p) {
      let v = p.valore * this.meteoOra().valore;
      if (this.luogo().id === "fiordo") v *= 1.15;
      return Math.floor(v);
    }

    /* ── cattura ── */
    cattura() {
      if (this.morso) this.morso.destroy();
      this.nascondiPesceAgganciato();
      const p      = this.pesce || this.scegliPesce(this.amo.y);
      const valore = this.valore(p);
      this.stato   = "animazione";
      this.s.catture += 1;
      this.suonaAudio("reel_sfx", { volume: 0.42, rate: 1.05 });
      this.suonaAudio("splash_sfx", { volume: 0.58, rate: 1.08 });

      this.s.registro.unshift({ nome: p.nome, valore, rarita: p.rarita });
      this.s.registro = this.s.registro.slice(0, 8);

      this.effettoRarita(p, () => this.popup(p, valore));
      this.salva();
    }

    manca() {
      if (this.morso) this.morso.destroy();
      this.nascondiPesceAgganciato();
      this.stato = "pronto";
      this.amo.x = this.s.x + AMO_X_OFFSET;
      this.amo.y = AMO_PRONTO_Y;
      this._amoTargetY = AMO_Y_MIN;
      this._amoArrivato = false;
      this._profonditaPrevista = null;
      this._cast = null;
      this.suonaAudio("splash_sfx", { volume: 0.24, rate: 0.82 });
      this.animaPescatore("pescatore_fermo_anim");
      this.toast("Scappato!");
    }

    /* ── effetti rarità ── */
    effettoRarita(p, dopo) {
      const livello = this.raritaIndice(p.rarita);

      if (livello < 2) {
        this.splash(this.amo.x, this.amo.y, col("#A9DBFF"));
        this.time.delayedCall(350, dopo);
        return;
      }

      const colore = col(p.colore === "arcobaleno" ? "#F6D36B" : p.colore);
      const flash  = this.add.rectangle(0, 0, W, H, colore, livello >= 5 ? 0.42 : 0.24)
        .setOrigin(0).setDepth(95);

      this.cameras.main.shake(livello >= 4 ? 380 : 180, livello >= 4 ? 0.01 : 0.004);
      this.tweens.add({
        targets: flash, alpha: 0,
        duration: livello >= 6 ? 1100 : 550,
        onComplete: () => { flash.destroy(); dopo(); }
      });

      for (let i = 0; i < 18 + livello * 4; i += 1) {
        this.scintilla(this.amo.x, this.amo.y, colore);
      }
    }

    splash(x, y, colore) {
      for (let i = 0; i < 12; i += 1) this.scintilla(x, y, colore);
    }

    scintilla(x, y, colore) {
      const s = this.add.circle(x, y, Phaser.Math.Between(2, 5), colore, 1).setDepth(96);
      this.tweens.add({
        targets: s,
        x: x + Phaser.Math.Between(-120, 120),
        y: y + Phaser.Math.Between(-90, 80),
        alpha: 0, duration: 650,
        onComplete: () => s.destroy()
      });
    }

    frameExtraPesce(p) {
      const row = (p.id * 7 + this.raritaIndice(p.rarita) * 3) % 24;
      const baseCol = ((p.id + this.raritaIndice(p.rarita)) % 4) * 4;
      return row * 16 + baseCol;
    }

    mostraPesceAgganciato(p) {
      this.nascondiPesceAgganciato();
      this._pesceMorsoBase = this.frameExtraPesce(p);
      const livello = this.raritaIndice(p.rarita);
      this.pesceMorsoSpr = this.add.sprite(this.amo.x + 32, this.amo.y + 12, "pesci_extra_sheet", this._pesceMorsoBase)
        .setScale(2.1 + livello * 0.14)
        .setAlpha(0.9)
        .setDepth(55);
    }

    nascondiPesceAgganciato() {
      if (!this.pesceMorsoSpr) return;
      this.pesceMorsoSpr.destroy();
      this.pesceMorsoSpr = null;
    }

    /* ── popup cattura ── */
    popup(p, valore) {
      const c = this.add.container(0, 0).setDepth(100);
      this.pannello = c;
      this.nascondiNav();

      const bordo = p.colore === "arcobaleno" ? "#F6D36B" : p.colore;
      const giaMuseo = this.s.scoperte.includes(p.id);

      c.add(this.add.rectangle(0, 0, W, H, 0, 0.78).setOrigin(0));
      c.add(this.add.rectangle(W / 2 + 8, H / 2 + 10, 650, 520, 0x000000, 0.22));
      c.add(this.add.rectangle(W / 2, H / 2, 650, 520, 0x091322, 1)
        .setStrokeStyle(4, col(bordo)));

      const titolo = this.add.text(W / 2, 124, p.nome, {
        fontFamily: "monospace", fontSize: 30,
        color: bordo, stroke: "#000", strokeThickness: 6
      }).setOrigin(0.5);
      if (titolo.width > 560) titolo.setFontSize(24);
      c.add(titolo);

      /* immagine pesce reale (grande) */
      c.add(this.add.image(W / 2, 350, chiavePesce(p.id))
        .setDisplaySize(250, 180));

      c.add(this.add.text(W / 2, 202, `${p.rarita}\n${p.desc}\n${valore} monete se venduto`, {
        fontFamily: "monospace", fontSize: 18, color: "#fff",
        align: "center", wordWrap: { width: 560 }
      }).setOrigin(0.5));

      c.add(this.add.text(W / 2, 470,
        giaMuseo ? "Gia presente nel museo." : "Vendi per monete oppure dona al museo: solo la donazione lo sblocca.",
        { fontFamily: "monospace", fontSize: 14, color: "#B8D7EC", align: "center", wordWrap: { width: 560 } }
      ).setOrigin(0.5));

      this.btn(W / 2 - 210, 542, 180, 52, "VENDI", () => {
        this.s.monete += valore;
        this.toast(`Venduto: +${valore} monete`);
        this.chiudi();
      }, 20, c);

      this.btn(W / 2 + 30, 542, 180, 52, giaMuseo ? "OK" : "MUSEO", () => {
        if (!giaMuseo && !this.s.scoperte.includes(p.id)) {
          this.s.scoperte.push(p.id);
          this.toast("Donato al museo!");
        }
        this.chiudi();
      }, 20, c);
    }

    chiudi() {
      if (!this.pannello) return;
      this.pannello.destroy();
      this.pannello = null;
      this.stato    = "pronto";
      this.amo.x = this.s.x + AMO_X_OFFSET;
      this.amo.y = AMO_PRONTO_Y;
      this._amoTargetY = AMO_Y_MIN;
      this._amoArrivato = false;
      this._profonditaPrevista = null;
      this._cast = null;
      this.nascondiPesceAgganciato();
      this.animaPescatore("pescatore_fermo_anim");
      this.salva();
      this.mostraNav();
    }

    nascondiNav() {
      if (this.btnsNav) this.btnsNav.forEach(b => b.setVisible(false));
    }

    mostraNav() {
      if (this.btnsNav) this.btnsNav.forEach(b => b.setVisible(true));
    }

    /* ── negozio ── */
    negozio() {
      if (this.pannello) return;
      this.nascondiNav();
      const c = this.add.container(0, 0).setDepth(100);
      this.pannello = c;

      c.add(this.add.rectangle(0, 0, W, H, 0x020713, 0.96).setOrigin(0));
      c.add(this.add.rectangle(0, 0, W, 92, 0x071624, 1).setOrigin(0));
      c.add(this.add.rectangle(0, 92, W, 4, 0xba7517, 1).setOrigin(0));
      c.add(this.add.text(46, 28, "Negozio del Pescatore", {
        fontFamily: "monospace", fontSize: 34, color: "#F6D36B",
        stroke: "#000", strokeThickness: 5
      }));
      c.add(this.add.text(885, 35, `Monete: ${this.s.monete}`, {
        fontFamily: "monospace", fontSize: 22, color: "#CFFFE2",
        stroke: "#000", strokeThickness: 4
      }));
      c.add(this.add.text(46, 72, `Canna: ${this.statCanna().nome}   Esca: ${this.s.esca || "nessuna"}`, {
        fontFamily: "monospace", fontSize: 14, color: "#9FC2D8"
      }));

      negozio.forEach((item, i) => {
        const x        = 54 + (i % 2) * 610;
        const y        = 122 + Math.floor(i / 2) * 122;
        const w        = 560;
        const h        = 98;
        const comprato = this.s.comprati.includes(item.id);
        const equip = (item.tipo === "canna" && this.s.canna === item.id) ||
          (item.tipo === "esca" && this.s.esca === item.id) ||
          (item.tipo === "speciale" && comprato);
        const coloreItem = item.tipo === "canna"
          ? col(item.colore || cannaBase.colore)
          : item.tipo === "esca" ? 0x5bc4a5 : 0xf6d36b;
        const cardFill = equip ? 0x123022 : comprato ? 0x102037 : 0x0a1422;
        const azione = equip ? "ATTIVO" : comprato ? "EQUIPAGGIA" : "ACQUISTA";
        const costo = comprato ? "gia comprato" : `${item.costo} monete`;
        const dettagli = item.tipo === "canna"
          ? `Prof. ${Math.round((item.maxNorm || 0) * 100)}%  Controllo ${Math.round((item.controllo || 0) * 100)}%  Morso ${item.finestra.toFixed(2)}s`
          : item.tipo === "esca" ? "Influenza le catture, ma non annulla la rarita." : "Bonus permanente.";

        c.add(this.add.rectangle(x + 6, y + 8, w, h, 0x000000, 0.22).setOrigin(0));
        c.add(this.add.rectangle(x, y, w, h, cardFill, 0.98)
          .setOrigin(0).setStrokeStyle(2, equip ? 0x6ee883 : coloreItem));
        c.add(this.add.rectangle(x, y, 10, h, coloreItem, 1).setOrigin(0));
        c.add(this.add.circle(x + 36, y + 48, 20, coloreItem, equip ? 0.9 : 0.55));

        c.add(this.add.text(x + 68, y + 13, `${equip ? "[ON] " : comprato ? "[OK] " : ""}${item.nome}`, {
          fontFamily: "monospace", fontSize: 19, color: "#fff",
          stroke: "#000", strokeThickness: 3
        }));
        c.add(this.add.text(x + 68, y + 39, item.testo, {
          fontFamily: "monospace", fontSize: 13, color: "#A9C9DF", wordWrap: { width: 315 }
        }));
        c.add(this.add.text(x + 68, y + 73, dettagli, {
          fontFamily: "monospace", fontSize: 11, color: "#E7DFAF"
        }));
        c.add(this.add.text(x + w - 154, y + 16, costo, {
          fontFamily: "monospace", fontSize: 12, color: comprato ? "#BDF6C6" : "#F6D36B",
          align: "right"
        }).setOrigin(0.5));

        this.btn(x + w - 162, y + 50, 136, 34, azione, () => this.compra(item), 12, c);
      });

      c.add(this.add.rectangle(54, 620, 1140, 38, 0x06101a, 0.9).setOrigin(0).setStrokeStyle(1, 0x2b506d));
      c.add(this.add.text(74, 630, "Le canne aprono profondita nuove; le esche aiutano, ma i pesci forti restano rari.", {
        fontFamily: "monospace", fontSize: 14, color: "#9FC2D8"
      }));

      this.btnClose(c);
    }

    compra(item) {
      if (item.tipo === "speciale" && this.s.comprati.includes(item.id)) {
        this.toast("Gia attivo.");
        return;
      }
      if (!this.s.comprati.includes(item.id)) {
        if (this.s.monete < item.costo) {
          this.toast("Monete insufficienti.");
          return;
        }
        this.s.monete -= item.costo;
        this.s.comprati.push(item.id);
      }
      if (item.tipo === "canna") this.s.canna = item.id;
      if (item.tipo === "esca")  this.s.esca  = item.id;
      this.chiudi();
      this.time.delayedCall(120, () => this.negozio());
    }

    /* ── luoghi ── */
    luoghi() {
      if (this.pannello) return;
      this.nascondiNav();
      const c = this.add.container(0, 0).setDepth(100);
      this.pannello = c;

      c.add(this.add.rectangle(0, 0, W, H, 0x03060d, 0.94).setOrigin(0));
      c.add(this.add.text(50, 35, "Luoghi di Pesca", {
        fontFamily: "monospace", fontSize: 34, color: "#CFFFE2"
      }));

      luoghi.forEach((l, i) => {
        const x         = 55 + (i % 3) * 402;
        const y         = 120 + Math.floor(i / 3) * 218;
        const sbloccato = this.s.luoghiSbloccati.includes(l.id);
        const attuale   = this.s.luogo === l.id;

        /* card sfondo */
        c.add(this.add.rectangle(x, y, 370, 176, col(l.cielo), 1)
          .setOrigin(0).setStrokeStyle(3, col(l.alga)));

        /* preview sfondo luogo */
        c.add(this.add.image(x + 185, y + 88, `sfondo_luogo_${i}`)
          .setDisplaySize(370, 176).setAlpha(0.38));

        c.add(this.add.text(x + 16, y + 16, l.nome, {
          fontFamily: "monospace", fontSize: 22, color: "#fff"
        }));
        c.add(this.add.text(x + 16, y + 52, `Bonus: ${l.bonus}`, {
          fontFamily: "monospace", fontSize: 14, color: "#FFF1B8"
        }));
        c.add(this.add.text(x + 16, y + 78, sbloccato
          ? (l.costo === 0 ? "Punto di partenza" : "Sbloccato ✔")
          : `Costo: ${l.costo} monete`, {
          fontFamily: "monospace", fontSize: 14,
          color: sbloccato ? "#BDF6C6" : "#F6D36B"
        }));

        this.btn(x + 200, y + 122, 148, 38,
          attuale   ? "ATTUALE"  :
          sbloccato ? "VAI QUI"  : "SBLOCCA",
          () => {
            if (!sbloccato) {
              if (this.s.monete < l.costo) {
                this.toast("Monete insufficienti.");
                return;
              }
              this.s.monete -= l.costo;
              this.s.luoghiSbloccati.push(l.id);
              this.toast(`${l.nome} sbloccato!`);
            }
            this.s.luogo = l.id;
            this.s.x     = Phaser.Math.Clamp(this.s.x, l.lim[0], l.lim[1]);
            this.amo.x   = this.s.x + AMO_X_OFFSET;
            this.chiudi();
          },
          14, c
        );
      });

      this.btnClose(c);
    }

    /* ── museo ── */
    museo() {
      if (this.pannello) return;
      this.nascondiNav();
      const c = this.add.container(0, 0).setDepth(100);
      this.pannello = c;

      const trovati = this.s.scoperte.length;
      const progresso = trovati / pesci.length;

      c.add(this.add.rectangle(0, 0, W, H, 0x030711, 0.98).setOrigin(0));
      c.add(this.add.rectangle(0, 0, W, 118, 0x091322, 1).setOrigin(0));
      c.add(this.add.rectangle(0, 118, W, 4, 0x6ca9ce, 1).setOrigin(0));
      c.add(this.add.text(34, 24, "Museo dei Mari", {
        fontFamily: "monospace", fontSize: 34, color: "#F6D36B",
        stroke: "#000", strokeThickness: 5
      }));
      c.add(this.add.text(34, 66, `${trovati}/112 donati`, {
        fontFamily: "monospace", fontSize: 18, color: "#CFFFE2"
      }));
      c.add(this.add.rectangle(190, 72, 360, 16, 0x0a1b2a, 1).setOrigin(0).setStrokeStyle(1, 0x31556e));
      c.add(this.add.rectangle(190, 72, 360 * progresso, 16, 0x6ee883, 1).setOrigin(0));

      ordine.forEach((r, i) => {
        const gruppo = pesci.filter((p) => p.rarita === r);
        const avuti = gruppo.filter((p) => this.s.scoperte.includes(p.id)).length;
        const x = 580 + (i % 4) * 140;
        const y = 22 + Math.floor(i / 4) * 42;
        const coloreR = col(rarita[r][0] === "arcobaleno" ? "#F6D36B" : rarita[r][0]);
        c.add(this.add.rectangle(x, y, 128, 30, 0x0a1422, 0.95).setOrigin(0).setStrokeStyle(1, coloreR));
        c.add(this.add.rectangle(x, y, 5, 30, coloreR, 1).setOrigin(0));
        c.add(this.add.text(x + 13, y + 7, `${r} ${avuti}/${gruppo.length}`, {
          fontFamily: "monospace", fontSize: 10, color: "#E9F6FF"
        }));
      });

      pesci.forEach((p, i) => {
        const x  = 34 + (i % 16) * 76;
        const y  = 144 + Math.floor(i / 16) * 70;
        const ok = this.s.scoperte.includes(p.id);
        const coloreR = col(p.colore === "arcobaleno" ? "#F6D36B" : p.colore);

        c.add(this.add.rectangle(x + 3, y + 4, 66, 56, 0x000000, 0.22).setOrigin(0));
        c.add(this.add.rectangle(x, y, 66, 56, ok ? 0x0d1c2c : 0x07101c, 1)
          .setOrigin(0).setStrokeStyle(1, ok ? coloreR : 0x31465d));
        c.add(this.add.rectangle(x, y, 66, 5, ok ? coloreR : 0x25364c, 1).setOrigin(0));

        if (ok) {
          c.add(this.add.image(x + 33, y + 27, chiavePesce(p.id)).setDisplaySize(44, 32));
        } else {
          c.add(this.add.text(x + 33, y + 24, "?", {
            fontFamily: "monospace", fontSize: 26, color: "#38516B"
          }).setOrigin(0.5));
        }

        c.add(this.add.text(x + 4, y + 42, ok ? p.nome : p.rarita, {
          fontFamily: "monospace", fontSize: ok ? 7 : 6, color: ok ? "#ffffff" : "#6f8498",
          align: "center", wordWrap: { width: 58 }
        }));
      });

      this.btnClose(c);
    }

    /* ── disegna scena ── */
    disegna(dt) {
      const l   = this.luogo();
      const m   = this.meteoOra();
      const ora = (this.s.tempo / 180) % 1;
      const giorno = ora > 0.25 && ora < 0.75;
      const indice = this.indiceLuogo();

      this.g.clear();
      this.fx.clear();

      /* sfondo cielo */
      this.sfondoLuogo
        .setTexture(`sfondo_luogo_${indice}`)
        .setAlpha(giorno ? 0.44 : 0.3)
        .setTint(giorno ? 0xffffff : 0x7f8cc9);

      this.fondaleAsset
        .setAlpha(giorno ? 0.14 : 0.24)
        .setTint(col(l.alga));

      /* tile acqua animato */
      this.acquaTessuto.tilePositionX = this.s.tempo * 18;
      this.acquaTessuto.tilePositionY = Math.sin(this.s.tempo * 0.8) * 8;

      /* cielo */
      this.g.fillStyle(col(giorno ? "#5EA9E8" : l.cielo));
      this.g.fillRect(0, 0, W, ACQUA);

      /* sole / luna */
      this.g.fillStyle(giorno ? 0xffd66b : 0xf7e8a9, 0.9);
      this.g.fillCircle(1138, 76, giorno ? 34 : 42);

      /* stelle */
      for (const s of this.stelle) {
        this.g.fillStyle(0xfff6d1, giorno ? 0.05 : 0.4 + Math.sin(this.s.tempo * 2 + s.f) * 0.25);
        this.g.fillCircle(s.x, s.y, s.r);
      }

      /* zone acqua */
      zone.forEach((z, i) => {
        this.g.fillStyle(col(l.acque[i]), 0.96);
        this.g.fillRect(0, ACQUA + i * ALTEZZA_ZONA, W, ALTEZZA_ZONA + 1);
        this.addZoneLabel(z[0], i);
      });

      /* effetti subacquei */
      this.disegnaFondale(l, m, dt);

      /* pontile */
      this.g.fillStyle(col(l.legno));
      this.g.fillRect(0, ACQUA - 38, l.lim[1] + 130, 38);

      const larghPontile = l.lim[1] + 150;
      this.pontileAsset
        .setPosition(larghPontile / 2, ACQUA - 27)
        .setSize(larghPontile, 72)
        .setDisplaySize(larghPontile, 72);

      this.capannaAsset.setPosition(24, ACQUA - 37);
      this.barcaAsset.setPosition(Math.min(W - 115, l.lim[1] + 210), ACQUA - 14);
      this.erbaAsset1.setPosition(Math.min(l.lim[1] - 80, 210), ACQUA - 38);
      this.erbaAsset2.setPosition(Math.min(l.lim[1] + 30, 382), ACQUA - 38);

      /* pescatore */
      if (this._velX === 0 || this.stato !== "pronto") {
        /* y gestita da muovi() con bob idle — qui aggiorniamo solo X */
        this.pescatore.setX(this.s.x);
      } else {
        this.pescatore.setPosition(this.s.x, ACQUA - 38);
      }

      const tensione = this._lenzaTensione || 1;
      const punta = this.puntoCanna();
      const puntaX = punta.x;
      const puntaY = punta.y;

      if (this.stato !== "pronto") {
        const curva = this.stato === "morso"
          ? Math.sin(this.s.tempo * 7) * (5 * tensione)
          : Math.sin(this.s.tempo * 4) * 4;
        const amoX = Phaser.Math.Clamp(this.amo.x + curva, 12, W - 12);
        const amoY = Phaser.Math.Clamp(this.amo.y, AMO_PRONTO_Y, AMO_Y_MAX);
        const spessLenza = this.stato === "morso" ? 2 + tensione * 1.2 : 2;
        this.g.lineStyle(spessLenza, 0xf1ead0, 0.96);
        this.g.lineBetween(puntaX, puntaY, amoX, amoY);
        if (this.stato === "morso" && tensione > 1.3) {
          this.g.lineStyle(spessLenza + 1, 0xff6b3b, 0.55);
          this.g.lineBetween(puntaX, puntaY, amoX, amoY);
        }
        this.g.fillStyle(0xf1ead0);
        this.g.fillCircle(amoX, amoY, 5);
      }

      /* barra carica forza lancio */
      if (this.stato === "carica") {
        const carica = Phaser.Math.Clamp((this._caricaTimer || 0) / 1.8, 0, 1);
        const bw     = 200;
        const bx     = W / 2 - bw / 2;
        const by     = ACQUA - 68;
        /* sfondo barra */
        this.g.fillStyle(0x0d1828, 0.85);
        this.g.fillRoundedRect(bx - 2, by - 2, bw + 4, 20, 4);
        /* barra riempita — verde→giallo→rosso */
        const col1 = carica < 0.6 ? 0x55ee77 : carica < 0.9 ? 0xf6d36b : 0xff4433;
        this.g.fillStyle(col1, 0.95);
        this.g.fillRoundedRect(bx, by, bw * carica, 16, 3);
        /* etichetta */
        if (!this._barraLabel) {
          this._barraLabel = this.add.text(W / 2, ACQUA - 88, "TIENI...",
            { fontFamily: "monospace", fontSize: 18, color: "#fff", stroke: "#000", strokeThickness: 5 }
          ).setOrigin(0.5).setDepth(80);
        }
        this._barraLabel.setText(carica < 0.9 ? "TIENI..." : "ORA!");
        this._barraLabel.setVisible(true);
      } else {
        if (this._barraLabel) this._barraLabel.setVisible(false);
      }

      /* cerchio finestra morso */
      if (this.stato === "morso") {
        this.g.lineStyle(6, 0x79ff6a, 0.9);
        this.g.beginPath();
        this.g.arc(
          this.amo.x, this.amo.y, 32,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * (this.tempoFinestra / this.finestra())
        );
        this.g.strokePath();
      }

      /* etichette zona */
      const zi = Phaser.Math.Clamp(
        Math.floor((this.amo.y - ACQUA) / ALTEZZA_ZONA), 0, 5
      );
      this.luogoTxt.setText(`Luogo: ${l.nome}`);
      this.zonaTxt.setText(`Zona: ${zone[zi][0]}  |  ${this.statCanna().nome}`);
      this.profTxt.setText(
        `PROFONDITÀ\n${zone[zi][0]}\n${Math.max(0, Math.floor((this.amo.y - ACQUA) * 12))} m`
      );
      this.disegnaProfondimetro(l);
      this.disegnaCinema(giorno, m);
    }

    disegnaCinema(giorno, m) {
      this.screenFx.clear();
      const t = this.s.tempo;
      const luce = giorno ? 0xfff0bd : 0x9bd0ff;

      for (let i = 0; i < 5; i += 1) {
        const baseX = 900 + i * 90 + Math.sin(t * 0.35 + i) * 24;
        this.screenFx.fillStyle(luce, giorno ? 0.032 : 0.018);
        this.screenFx.fillTriangle(baseX, 0, baseX + 130, 0, baseX - 110 + Math.sin(t + i) * 18, ACQUA + 120);
      }

      for (let i = 0; i < 26; i += 1) {
        const x = (i * 71 + t * 74) % (W + 160) - 80;
        const y = ACQUA + 8 + Math.sin(t * 1.4 + i) * 7;
        const a = 0.12 + Math.sin(t * 2.5 + i) * 0.05;
        this.screenFx.lineStyle(2, 0xe7fbff, a);
        this.screenFx.lineBetween(x, y, x + 54, y + Math.sin(t + i) * 5);
      }

      if (m.id === "temporale" && Math.sin(t * 6.7) > 0.965) {
        this.screenFx.fillStyle(0xd8efff, 0.18);
        this.screenFx.fillRect(0, 0, W, H);
      }

      this.screenFx.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.36, 0.36, 0, 0);
      this.screenFx.fillRect(0, 0, W, 140);
      this.screenFx.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.48, 0.48);
      this.screenFx.fillRect(0, H - 160, W, 160);
      this.screenFx.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.34, 0, 0.34, 0);
      this.screenFx.fillRect(0, 0, 180, H);
      this.screenFx.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.34, 0, 0.34);
      this.screenFx.fillRect(W - 180, 0, 180, H);
    }

    disegnaProfondimetro(l) {
      const x = 1220;
      const y = 292;
      const w = 26;
      const h = 350;
      this.g.fillStyle(0x06101a, 0.72);
      this.g.fillRoundedRect(x - 8, y - 10, w + 16, h + 20, 7);
      for (let i = 0; i < 6; i += 1) {
        this.g.fillStyle(col(l.acque[i]), 0.96);
        this.g.fillRect(x, y + i * h / 6, w, h / 6 + 1);
      }
      this.g.lineStyle(2, 0xd8f4ff, 0.72);
      this.g.strokeRect(x, y, w, h);

      const markerY = y + Phaser.Math.Clamp((Phaser.Math.Clamp(this.amo.y, AMO_Y_MIN, AMO_Y_MAX) - AMO_Y_MIN) / PROFONDITA_GIOCABILE, 0, 1) * h;
      this.g.fillStyle(0xffffff, 1);
      this.g.fillTriangle(x - 8, markerY, x - 1, markerY - 6, x - 1, markerY + 6);

      const previsto = this._profonditaPrevista;
      if (previsto) {
        const targetY = y + Phaser.Math.Clamp((previsto - AMO_Y_MIN) / PROFONDITA_GIOCABILE, 0, 1) * h;
        this.g.lineStyle(3, 0xf6d36b, 0.9);
        this.g.lineBetween(x - 3, targetY, x + w + 3, targetY);
      }
    }

    disegnaFondale(l, m, dt) {
      /* raggi di luce */
      for (let i = 0; i < 10; i += 1) {
        const y = ACQUA + 24 + i * 38 + Math.sin(this.s.tempo * 1.2 + i) * 5;
        const x = 260 + ((this.s.tempo * 25 + i * 137) % (W - 250));
        this.fx.lineStyle(2, 0x9be8ff,
          m.id === "nebbia" ? 0.04 : 0.06 + Math.sin(this.s.tempo * 1.7 + i) * 0.025
        );
        this.fx.lineBetween(x - 70, y, x + 70, y + Math.sin(this.s.tempo + i) * 6);
      }

      /* alghe */
      for (const a of this.alghe) {
        const y = ACQUA + a.z * ALTEZZA_ZONA + 60;
        this.g.lineStyle(2, col(l.alga), 0.35);
        this.g.lineBetween(
          a.x, y,
          a.x + Math.sin(this.s.tempo * 1.8 + a.f) * 10,
          y - a.h
        );
      }

      /* bolle */
      for (const b of this.bolle) {
        b.y -= b.v * dt;
        if (b.y < ACQUA) {
          b.y = H + 30;
          b.x = Phaser.Math.Between(260, W);
        }
        this.fx.lineStyle(1, 0xcff6ff, 0.25);
        this.fx.strokeCircle(b.x, b.y, b.r);
      }

      /* pesci decorativi */
      for (const f of this.sfondoPesci) {
        f.x += f.v * f.d * dt;
        if (f.x < -40) f.x = W + 40;
        if (f.x > W + 40) f.x = -40;
        f.spr.setPosition(f.x, f.y).setFlipX(f.d < 0);
      }

      for (const f of this.sfondoPesciExtra) {
        f.x += f.v * f.d * dt;
        if (f.x < -70) f.x = W + 70;
        if (f.x > W + 70) f.x = -70;
        const anim = Math.floor(this.s.tempo * 8 + f.phase) % 4;
        f.spr
          .setFrame(f.row * 16 + f.baseCol + anim)
          .setPosition(f.x, f.baseY + Math.sin(this.s.tempo * f.freq + f.phase) * f.amp)
          .setFlipX(f.d < 0)
          .setRotation(Math.sin(this.s.tempo * f.freq + f.phase) * 0.08);
      }

      /* pioggia / temporale */
      if (m.id === "pioggia" || m.id === "temporale") {
        this.fx.lineStyle(1, 0xa8d7ff, m.id === "temporale" ? 0.55 : 0.32);
        for (let i = 0; i < 70; i += 1) {
          const x = (i * 41 + this.s.tempo * 180) % (W + 80) - 80;
          const y = (i * 73 + this.s.tempo * 360) % H;
          this.fx.lineBetween(x, y, x - 12, y + 24);
        }
      }

      /* nebbia */
      if (m.id === "nebbia") {
        this.fx.fillStyle(0xd7e7f2, 0.09);
        for (let i = 0; i < 7; i += 1) {
          this.fx.fillEllipse(
            W / 2 + Math.sin(this.s.tempo * 0.3 + i) * 80,
            ACQUA - 10 + i * 72,
            W * 0.9, 48
          );
        }
      }
    }

    addZoneLabel(t, i) {
      if (!this.labels) this.labels = [];
      if (!this.labels[i]) {
        this.labels[i] = this.add.text(
          W - 344, ACQUA + i * ALTEZZA_ZONA + 12, "",
          { fontFamily: "monospace", fontSize: 15, color: "#e9f6ff", stroke: "#000", strokeThickness: 4 }
        ).setDepth(20).setAlpha(0.78);
      }
      this.labels[i].setText(t);
    }

    apriImpostazioni() {
      if (this.pannello) return;
      this.nascondiNav();
      const c = this.add.container(0, 0).setDepth(200);
      this.pannello = c;

      c.add(this.add.rectangle(0, 0, W, H, 0x020713, 0.72).setOrigin(0).setInteractive());
      c.add(this.add.rectangle(W / 2 + 6, H / 2 + 10, 660, 470, 0x000000, 0.28));
      c.add(this.add.rectangle(W / 2, H / 2, 660, 470, 0x10131a, 0.96)
        .setStrokeStyle(3, 0xf3bc62, 0.95));
      c.add(this.add.rectangle(W / 2, 148, 660, 70, 0x5e3218, 0.96)
        .setStrokeStyle(2, 0xf6d36b, 0.85));
      c.add(this.add.text(W / 2, 147, "IMPOSTAZIONI", {
        fontFamily: "monospace", fontSize: 32, color: "#fff7db",
        stroke: "#000", strokeThickness: 6
      }).setOrigin(0.5));

      this.sliderImp(c, 392, 230, "LUMINOSITA", 0.65, 1.25, impostazioni.luminosita, (v) => {
        impostazioni.luminosita = v;
        salvaImpostazioni();
        aggiornaOverlayLuminosita(this);
      });
      this.sliderImp(c, 392, 318, "MUSICA", 0, 1, impostazioni.volumeMusica, (v) => {
        impostazioni.volumeMusica = v;
        salvaImpostazioni();
        applicaVolumi(this);
      });
      this.sliderImp(c, 392, 406, "EFFETTI", 0, 1, impostazioni.volumeEffetti, (v) => {
        impostazioni.volumeEffetti = v;
        salvaImpostazioni();
      });

      this.bottoneImp(c, 392, 505, 178, 48, impostazioni.muto ? "AUDIO OFF" : "AUDIO ON", () => {
        impostazioni.muto = !impostazioni.muto;
        salvaImpostazioni();
        applicaVolumi(this);
        if (!impostazioni.muto) this.avviaAudio(true);
        this.chiudi();
        this.time.delayedCall(90, () => this.apriImpostazioni());
      }, 17);
      this.bottoneImp(c, 606, 505, 250, 48, "TORNA", () => this.chiudi(), 18);
      this.bottoneImp(c, 915, 132, 42, 42, "X", () => this.chiudi(), 21);
    }

    sliderImp(parent, x, y, label, min, max, value, onChange) {
      const width = 430;
      const pct = () => (value - min) / (max - min);
      const title = this.add.text(x, y - 28, label, {
        fontFamily: "monospace", fontSize: 17, color: "#ffe3a0",
        stroke: "#000", strokeThickness: 4
      });
      const valoreTxt = this.add.text(x + width, y - 28, "", {
        fontFamily: "monospace", fontSize: 17, color: "#ffffff",
        stroke: "#000", strokeThickness: 4
      }).setOrigin(1, 0);
      const barBg = this.add.rectangle(x, y, width, 10, 0x3a2417, 1)
        .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      const bar = this.add.rectangle(x, y, width * pct(), 10, 0xf6d36b, 1)
        .setOrigin(0, 0.5);
      const knob = this.add.circle(x + width * pct(), y, 16, 0xfff2c2, 1)
        .setStrokeStyle(3, 0x4a2412).setInteractive({ useHandCursor: true, draggable: true });
      parent.add([title, valoreTxt, barBg, bar, knob]);
      this.input.setDraggable(knob);

      const aggiorna = (worldX) => {
        const p = clamp((worldX - x) / width, 0, 1);
        value = min + p * (max - min);
        bar.setSize(width * p, 10);
        knob.setX(x + width * p);
        valoreTxt.setText(`${Math.round(value * 100)}%`);
        onChange(value);
      };

      aggiorna(x + width * pct());
      barBg.on("pointerdown", (pointer) => aggiorna(pointer.x));
      knob.on("drag", (pointer) => aggiorna(pointer.x));
    }

    bottoneImp(parent, x, y, w, h, t, cb, fs = 16) {
      const c = this.add.container(x, y);
      const ombra = this.add.rectangle(5, 7, w, h, 0x000000, 0.28).setOrigin(0);
      const r = this.add.rectangle(0, 0, w, h, 0x8d4b22, 0.98)
        .setOrigin(0).setStrokeStyle(2, 0xf6d36b, 0.9)
        .setInteractive({ useHandCursor: true });
      const hi = this.add.rectangle(4, 4, w - 8, 8, 0xffd890, 0.25).setOrigin(0);
      const tx = this.add.text(w / 2, h / 2, t, {
        fontFamily: "monospace", fontSize: fs, color: "#fff",
        stroke: "#000", strokeThickness: 5
      }).setOrigin(0.5);
      r.on("pointerover", () => r.setFillStyle(0xb86528, 1));
      r.on("pointerout",  () => r.setFillStyle(0x8d4b22, 0.98));
      r.on("pointerdown", cb);
      c.add([ombra, r, hi, tx]);
      parent.add(c);
      return c;
    }

    /* ── helper bottone ── */
    btn(x, y, w, h, t, cb, fs = 16, parent = null) {
      const c  = this.add.container(x, y).setDepth(120);
      const shadow = this.add.rectangle(5, 7, w, h, 0x000000, 0.28).setOrigin(0);
      const r  = this.add.rectangle(0, 0, w, h, 0x9b5524, 0.96)
        .setOrigin(0)
        .setStrokeStyle(2, 0xf6d36b, 0.82)
        .setInteractive({ useHandCursor: true });
      const top = this.add.rectangle(4, 4, w - 8, 7, 0xffd58b, 0.24).setOrigin(0);
      const tx = this.add.text(w / 2, h / 2, t, {
        fontFamily: "monospace", fontSize: fs, color: "#fff",
        stroke: "#000", strokeThickness: Math.max(3, Math.floor(fs / 4))
      }).setOrigin(0.5);
      if (tx.width > w - 18) {
        tx.setFontSize(Math.max(10, Math.floor(fs * (w - 18) / tx.width)));
      }

      r.on("pointerover",  () => {
        r.setFillStyle(0xc6752e, 1);
        tx.setY(h / 2 - 1);
      });
      r.on("pointerout",   () => {
        r.setFillStyle(0x9b5524, 0.96);
        tx.setY(h / 2);
      });
      r.on("pointerdown",  cb);

      c.add([shadow, r, top, tx]);
      c.hit = r;
      c.bg = r;
      c.label = tx;
      if (parent) parent.add(c);
      return c;
    }

    btnClose(parent, cb = () => this.chiudi()) {
      return this.btn(W - 66, 24, 42, 42, "X", cb, 21, parent);
    }

    toast(t) {
      const a = this.add.text(W / 2, 90, t, {
        fontFamily: "monospace", fontSize: 22,
        color: "#fff", backgroundColor: "#07111f"
      }).setOrigin(0.5).setDepth(150);

      this.tweens.add({
        targets: a, alpha: 0, y: 50,
        duration: 1500,
        onComplete: () => a.destroy()
      });
    }

    salva() {
      localStorage.setItem(CHIAVE, JSON.stringify(this.s));
    }
  }

  /* ── avvio Phaser ── */
  window.addEventListener("load", () => new Phaser.Game({
    type: Phaser.AUTO,
    width:  W,
    height: H,
    parent: "gioco",
    pixelArt: true,
    scale: {
      mode:       Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScena, Scena]
  }));
})();
