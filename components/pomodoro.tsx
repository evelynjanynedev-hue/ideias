"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { registrarResultado } from "@/app/actions";
import { FASES, duracao, fasesDaTarefa, type FaseKey } from "@/lib/tempo";
import type { Tarefa } from "@/lib/types";
import { Ico } from "./icons";

const PADRAO: Record<FaseKey, number> = {
  analisar: 5,
  organizar: 5,
  criar: 10,
  executar: 25,
  registrar: 5,
};

const CHAVE = "zyra.pomodoro.v1";

type Salvo = {
  fase: FaseKey;
  tarefaId: string;
  total: number;
  restante: number;
  rodando: boolean;
  fimEm: number | null;
};

function formatar(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function minutosDaFase(tarefa: Tarefa | undefined, fase: FaseKey): number {
  if (!tarefa) return PADRAO[fase];
  const { minutos } = fasesDaTarefa(tarefa);
  return minutos[fase] > 0 ? minutos[fase] : PADRAO[fase];
}

function tocarSinal() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    /* som é um extra, não um requisito */
  }
}

/**
 * Pomodoro por fase: analisar, organizar, criar, executar e registrar.
 * O tempo de cada fase vem da própria tarefa; sem tarefa, usa um padrão.
 * O estado vive no navegador, então o relógio continua ao trocar de tela.
 */
export function Pomodoro({
  tarefas = [],
  compacto = false,
}: {
  tarefas?: Tarefa[];
  compacto?: boolean;
}) {
  const [fase, setFase] = useState<FaseKey>("executar");
  const [tarefaId, setTarefaId] = useState("");
  const [total, setTotal] = useState(PADRAO.executar * 60);
  const [restante, setRestante] = useState(PADRAO.executar * 60);
  const [rodando, setRodando] = useState(false);
  const [fimEm, setFimEm] = useState<number | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [pronto, setPronto] = useState(false);
  const tituloOriginal = useRef<string | null>(null);

  const tarefaAtual = useMemo(
    () => tarefas.find((t) => t.id === tarefaId),
    [tarefas, tarefaId],
  );
  const faseAtual = FASES.find((f) => f.key === fase) ?? FASES[3];
  const cor = faseAtual.cor;

  /* Carrega o último relógio salvo. */
  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) {
        const salvo = JSON.parse(bruto) as Partial<Salvo>;
        const novaFase =
          salvo.fase && FASES.some((f) => f.key === salvo.fase)
            ? salvo.fase
            : "executar";
        const novoTarefaId =
          typeof salvo.tarefaId === "string" ? salvo.tarefaId : "";
        const novoTotal =
          typeof salvo.total === "number" && salvo.total > 0
            ? salvo.total
            : PADRAO[novaFase] * 60;

        setFase(novaFase);
        setTarefaId(novoTarefaId);
        setTotal(novoTotal);

        if (salvo.rodando && typeof salvo.fimEm === "number") {
          const seg = Math.max(
            0,
            Math.round((salvo.fimEm - Date.now()) / 1000),
          );
          setRestante(seg);
          if (seg <= 0) {
            setRodando(false);
            setFimEm(null);
            setConcluido(true);
          } else {
            setRodando(true);
            setFimEm(salvo.fimEm);
          }
        } else {
          setRestante(
            typeof salvo.restante === "number"
              ? Math.max(0, salvo.restante)
              : novoTotal,
          );
          setRodando(false);
          setFimEm(null);
          setConcluido(false);
        }
      }
    } catch {
      /* estado corrompido: começa limpo */
    }
    setPronto(true);
  }, []);

  /* Persiste para o relógio sobreviver à navegação. */
  useEffect(() => {
    if (!pronto) return;
    try {
      const salvo: Salvo = { fase, tarefaId, total, restante, rodando, fimEm };
      window.localStorage.setItem(CHAVE, JSON.stringify(salvo));
    } catch {
      /* modo privado pode bloquear o storage */
    }
  }, [pronto, fase, tarefaId, total, restante, rodando, fimEm]);

  /* Se a tarefa salva saiu da lista, volta para tempo livre. */
  useEffect(() => {
    if (tarefaId && !tarefas.some((t) => t.id === tarefaId)) {
      setTarefaId("");
    }
  }, [tarefas, tarefaId]);

  /* Permite abrir o relógio já apontando para uma tarefa e fase. */
  const urlAplicada = useRef(false);
  useEffect(() => {
    if (urlAplicada.current) return;
    urlAplicada.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const faseUrl = params.get("fase");
      const tarefaUrl = params.get("tarefa");
      if (!faseUrl && !tarefaUrl) return;

      const novaFase: FaseKey =
        faseUrl && FASES.some((f) => f.key === faseUrl)
          ? (faseUrl as FaseKey)
          : "executar";
      const tarefa = tarefaUrl
        ? tarefas.find((t) => t.id === tarefaUrl)
        : undefined;
      const minutos = minutosDaFase(tarefa, novaFase);

      setFase(novaFase);
      if (tarefaUrl) setTarefaId(tarefaUrl);
      setTotal(minutos * 60);
      setRestante(minutos * 60);
      setRodando(false);
      setFimEm(null);
      setConcluido(false);
    } catch {
      /* URL inválida: segue o estado salvo */
    }
  }, [tarefas]);

  /* Contagem baseada no relógio real, sem acumular erro. */
  useEffect(() => {
    if (!rodando || fimEm === null) return;

    const tick = () => {
      const seg = Math.max(0, Math.round((fimEm - Date.now()) / 1000));
      setRestante(seg);
      if (seg <= 0) {
        setRodando(false);
        setFimEm(null);
        setConcluido(true);
        tocarSinal();
      }
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [rodando, fimEm]);

  /* Mostra a contagem no título da aba enquanto o foco está ativo. */
  useEffect(() => {
    if (rodando) {
      if (tituloOriginal.current === null) {
        tituloOriginal.current = document.title;
      }
      document.title = `${formatar(restante)} · ${faseAtual.label} — Zyra`;
    } else if (tituloOriginal.current !== null) {
      document.title = tituloOriginal.current;
      tituloOriginal.current = null;
    }
  }, [rodando, restante, faseAtual.label]);

  useEffect(() => {
    return () => {
      if (tituloOriginal.current !== null) {
        document.title = tituloOriginal.current;
      }
    };
  }, []);

  const aplicar = (novaFase: FaseKey, novoTarefaId = tarefaId) => {
    const tarefa = tarefas.find((t) => t.id === novoTarefaId);
    const minutos = minutosDaFase(tarefa, novaFase);
    setFase(novaFase);
    setTarefaId(novoTarefaId);
    setTotal(minutos * 60);
    setRestante(minutos * 60);
    setRodando(false);
    setFimEm(null);
    setConcluido(false);
  };

  const iniciar = () => {
    const seg = restante > 0 ? restante : total;
    setRestante(seg);
    setFimEm(Date.now() + seg * 1000);
    setRodando(true);
    setConcluido(false);
  };

  const pausar = () => {
    if (fimEm !== null) {
      setRestante(Math.max(0, Math.round((fimEm - Date.now()) / 1000)));
    }
    setRodando(false);
    setFimEm(null);
  };

  const reiniciar = () => {
    setRestante(total);
    setRodando(false);
    setFimEm(null);
    setConcluido(false);
  };

  const ajustar = (deltaMinutos: number) => {
    const novo = Math.min(90 * 60, Math.max(60, total + deltaMinutos * 60));
    setTotal(novo);
    setRestante(novo);
    setRodando(false);
    setFimEm(null);
    setConcluido(false);
  };

  const pct = total > 0 ? Math.min(100, ((total - restante) / total) * 100) : 0;
  const raio = 54;
  const circ = 2 * Math.PI * raio;

  return (
    <div className={`card p-3 ${compacto ? "" : "sm:p-4"}`}>
      <div className="flex items-start gap-2">
        <span
          className="icon-tile h-8 w-8 shrink-0"
          style={{ backgroundColor: `${cor}18`, color: cor }}
        >
          <Ico nome="ampulheta" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-cream">Relógio de foco</p>
          <p className="text-[10px] text-muted/70">
            pomodoro por fase · análise, execução e resultado
          </p>
        </div>
        <span className="chip border-line/60 bg-white/45 text-[9px] text-muted">
          {rodando ? "em foco" : concluido ? "concluído" : "parado"}
        </span>
      </div>

      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
        <div
          className="relative grid shrink-0 place-items-center"
          style={{ width: 132, height: 132 }}
        >
          <svg width={132} height={132} className="-rotate-90" aria-hidden="true">
            <circle
              cx={66}
              cy={66}
              r={raio}
              fill="none"
              stroke="#eae2d3"
              strokeWidth={8}
            />
            <circle
              cx={66}
              cy={66}
              r={raio}
              fill="none"
              stroke={cor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset .45s linear" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-[26px] leading-none font-semibold tracking-tight text-cream tabular-nums">
                {formatar(restante)}
              </p>
              <p
                className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em]"
                style={{ color: cor }}
              >
                {faseAtual.label}
              </p>
              <p className="mt-0.5 text-[8px] text-muted/60">
                {duracao(total / 60)}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <label className="label" htmlFor="pomodoro-tarefa">
            tarefa
          </label>
          <select
            id="pomodoro-tarefa"
            value={tarefaId}
            onChange={(e) => aplicar(fase, e.target.value)}
            className="field h-8 text-[11px]"
          >
            <option value="">tempo livre</option>
            {tarefas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titulo}
              </option>
            ))}
          </select>

          <div className="mt-1.5 grid grid-cols-5 gap-1">
            {FASES.map((f) => {
              const ativa = f.key === fase;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => aplicar(f.key)}
                  title={f.pergunta}
                  className={`rounded-md border px-1 py-1.5 text-[9px] font-medium transition ${
                    ativa
                      ? ""
                      : "border-line/60 bg-white/40 text-muted hover:bg-white/70"
                  }`}
                  style={
                    ativa
                      ? {
                          borderColor: f.cor,
                          backgroundColor: `${f.cor}16`,
                          color: f.cor,
                        }
                      : undefined
                  }
                >
                  {f.curto}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => ajustar(-5)}
              className="btn-ghost h-7 px-2 text-[10px]"
              title="menos 5 minutos"
            >
              −5
            </button>
            <button
              type="button"
              onClick={() => ajustar(5)}
              className="btn-ghost h-7 px-2 text-[10px]"
              title="mais 5 minutos"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => aplicar(fase)}
              className="btn-ghost ml-auto h-7 px-2 text-[10px]"
              title="usar o tempo desta fase na tarefa"
            >
              tempo da fase
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="btn-quiet h-7 px-1.5 text-muted"
              title="reiniciar"
            >
              <Ico nome="revisao" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-line/60 bg-white/45 px-2.5 py-1.5 text-[10px] leading-relaxed text-muted">
        <Ico
          nome="faisca"
          className="mt-0.5 h-3 w-3 shrink-0"
          style={{ color: cor }}
        />
        {faseAtual.pergunta}
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={rodando ? pausar : iniciar}
          className="btn-gold h-9 flex-1 text-xs"
          style={{ backgroundColor: cor, borderColor: cor }}
        >
          <Ico nome={rodando ? "pausa" : "play"} className="h-3.5 w-3.5" />
          {rodando
            ? "pausar"
            : concluido
              ? "recomeçar"
              : restante < total
                ? "continuar"
                : "iniciar foco"}
        </button>
        {tarefaAtual ? (
          <Link
            href="/tarefas"
            className="btn-ghost h-9 px-2.5 text-[10px]"
            title="ver tarefa na lista"
          >
            ver tarefa
            <Ico nome="seta" className="h-3 w-3" />
          </Link>
        ) : null}
      </div>

      {concluido ? (
        <div className="mt-2 rounded-lg border border-done/30 bg-done/[0.06] px-2.5 py-2">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-done">
            <Ico nome="check-circulo" className="h-3 w-3" />
            sessão concluída · {duracao(total / 60)} de{" "}
            {faseAtual.label.toLowerCase()}
          </p>
          {tarefaAtual ? (
            <form action={registrarResultado} className="mt-1.5">
              <input type="hidden" name="id" value={tarefaAtual.id} />
              <textarea
                name="resultado"
                rows={2}
                placeholder="O que ficou de concreto? Registre o resultado desta fase."
                className="field resize-y text-[10px] leading-relaxed"
              />
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[9px] text-muted/60">
                  fecha o ciclo · fase registrar
                </span>
                <button type="submit" className="btn-ghost h-7 px-2 text-[10px]">
                  <Ico nome="check" className="h-3 w-3" />
                  registrar
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-1 text-[10px] text-muted">
              Escolha uma tarefa para registrar o resultado desta sessão.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
