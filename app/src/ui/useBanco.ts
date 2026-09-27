// Adapter de React para o banco de multipla escolha.
//
// A leitura em si e do dominio (`carregarBanco`, em `src/domain/questoes.ts`), que ja resolve
// de onde o bruto vem em cada build: inline no navegador, arquivo ao lado do HTML no desktop.
// Aqui ficam so as tres coisas que sao da tela: ler UMA vez por sessao, guardar o resultado e
// contar se ainda esta carregando. Duplicar a leitura aqui seria manter dois carregadores e
// duas conferencias de forma para o mesmo arquivo.

import { useEffect, useState } from 'react'
import { carregarBanco, type Banco } from '../domain/questoes'

/** Mesma mensagem de falha do conteudo, com o comando que gera o banco. */
const ERRO_DE_LEITURA =
  'Não consegui carregar o banco de questões. Rode `npm run build:questions` e recarregue.'

let leitura: Promise<Banco | null> | null = null

/**
 * Uma leitura por sessao, guardada no modulo e nao no componente.
 *
 * O `StrictMode` monta o efeito duas vezes em desenvolvimento, e a tela pode ser aberta e
 * fechada varias vezes sem sair do aplicativo: nos dois casos a leitura e devolvida do mesmo
 * `Promise`. A falha tambem fica guardada — reabrir a tela na mesma sessao nao vai encontrar
 * o arquivo que faltou.
 */
function lerUmaVez(): Promise<Banco | null> {
  leitura ??= carregarBanco()
  return leitura
}

export interface BancoCarregado {
  /** null enquanto carrega ou quando a leitura falhou. */
  banco: Banco | null
  erro: string | null
  carregando: boolean
}

/**
 * Le o banco e conta o que aconteceu.
 *
 * O dominio devolve null quando o banco nao veio (arquivo ausente, JSON quebrado, forma
 * inesperada) e ja registra a causa no console; aqui so sobra o recado da tela. A falha nao
 * vira "quiz vazio": escopo sem itens e uma afirmacao, e uma leitura que falhou nao autoriza
 * ninguem a fazer essa afirmacao — o mesmo cuidado que o painel tem com o progresso.
 */
export function useBanco(): BancoCarregado {
  const [estado, setEstado] = useState<BancoCarregado>({
    banco: null,
    erro: null,
    carregando: true,
  })

  useEffect(() => {
    let vivo = true
    void lerUmaVez().then((banco) => {
      if (!vivo) return
      setEstado(
        banco
          ? { banco, erro: null, carregando: false }
          : { banco: null, erro: ERRO_DE_LEITURA, carregando: false },
      )
    })
    return () => {
      vivo = false
    }
  }, [])

  return estado
}
