# Regras de interação entre temas

Um tema isolado ensina; dois temas ligados ensinam a decidir. Estas regras definem **como** um
tema declara sua relação com outros temas — inclusive de áreas diferentes — e como essa relação é
verificada.

## 1. Onde a relação mora

A **fonte única** é o `relacoes` no frontmatter do tema. Tudo o mais é visão derivada:

| Onde | Natureza |
|---|---|
| `relacoes` no frontmatter do `TEMA-*.md` | **fonte** |
| Seção "Conexões com outros temas" no corpo do próprio tema | visão legível da mesma relação |
| Seção "Conexões com outras áreas" no guia da área | agregação das saídas dos seus temas |
| `mapa-relacoes.md` na raiz | agregação global, gerada por `scripts/relacoes.py` |

Nunca declare uma relação só no corpo e esqueça o frontmatter: o validador acusa divergência.

## 2. Vocabulário controlado

Cinco relações. Nenhuma outra é permitida sem alterar este documento.

| Relação | Chave YAML | Simétrica | Direção | Para que serve |
|---|---|---|---|---|
| Pré-requisito | `pre_requisitos` | não | este ⟶ depende do alvo | ordem de estudo |
| Complementa | `complementa` | **sim** | este ⟷ alvo | dois temas cobrem metades do mesmo problema e devem ser lidos juntos |
| Aprofundado por | `aprofundado_por` | não | este é introdutório ⟶ alvo é a versão técnica | escada de profundidade |
| Aplicado em | `aplicado_em` | não | a teoria aqui ⟶ a prática ali | ponte entre conceito e execução |
| Não confundir com | `nao_confundir_com` | **sim** | este ⟷ alvo | distinção conceitual que evita erro grosseiro |

`complementa` é a relação mais importante deste roadmap: é ela que costura áreas diferentes. As
outras quatro são de apoio.

## 3. Formato

```yaml
relacoes:
  complementa:
    - alvo: "05-rede-infraestrutura#TEMA-04"
      motivo: "zero trust não fecha sem segmentação; identidade sozinha só autentica"
  aprofundado_por:
    - alvo: "07-criptografia-segredos#TEMA-02"
      motivo: "aqui o TLS é usado como caixa-preta; lá está a mecânica de chaves e certificados"
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-05"
      motivo: "a severidade definida no conceito é o que a triagem do SOC precisa priorizar"
  nao_confundir_com:
    - alvo: "13-ofensiva-pentest#TEMA-01"
      motivo: "varredura acha vulnerabilidade em escala; pentest encadeia exploração com julgamento humano"
```

O alvo é sempre `area_id#tema_id`. Nunca nome de arquivo: inserir um tema no meio renumera os
seguintes e quebraria o vínculo.

## 4. Regras

1. **Todo alvo tem `motivo`**, em uma linha, específico. Sem motivo, a relação é decorativa e não
   entra.
2. **Alvo no formato `area_id#tema_id`.** `07-criptografia-segredos#TEMA-02`, não `TEMA-02-....md`.
3. **Simetria obrigatória** em `complementa` e `nao_confundir_com`: se A declara B, B declara A.
   O validador reprova a assimetria.
4. **No máximo 5 relações por tema**, somando todos os tipos. Acima disso vira teia: a relação
   perde valor de sinal. Priorize as de fora da área.
5. **`complementa` nunca substitui `pre_requisitos`.** Complementar significa "leia junto";
   pré-requisito significa "leia antes". Não converta uma na outra para resolver pressa.
6. **O alvo precisa existir** (tema já escrito) ou estar marcado como planejado com
   `pendente: true`. Relação para tema inexistente e não marcado é **erro**.
7. **Proibido auto-referência** e proibido ligar dois temas por mais de uma relação ao mesmo tempo
   (escolha a mais forte).
8. **Prioridade é cross-area.** Relações dentro da própria área são opcionais — o guia da área já
   sequencia os temas. As relações que atravessam áreas são o produto deste mecanismo e aparecem
   obrigatoriamente em `mapa-relacoes.md`.
9. **Relação não é fonte.** Aqui se ligam temas internos; afirmações normativas continuam exigindo
   fonte primária pelo protocolo do CONTRIBUTING.
10. **Frescor herda do tema.** Se um tema muda de escopo, suas relações são reavaliadas na mesma
    revisão.

## 5. Quando usar cada uma

| Situação | Relação |
|---|---|
| Dois temas explicam o mesmo ataque, um pela defesa e outro pela ofensiva | `complementa` |
| Um número só faz sentido com o número do outro (apetite de risco e risco medido) | `complementa` |
| Você lê o tema e pensa "e como isso funciona por dentro?" | `aprofundado_por` |
| O conceito vira procedimento em outra área | `aplicado_em` |
| Dois termos parecidos que a maioria confunde (autenticação e autorização; vulnerabilidade e risco; backup e continuidade) | `nao_confundir_com` |

## 6. Exemplos reais de pares cross-area previstos

Estes pares são o alvo do mecanismo. Ficam registrados aqui como referência de calibração; o
validador só os exige quando os temas existirem.

| Área A | Área B | Relação | Ideia |
|---|---|---|---|
| 01-fundamentos (risco) | 02-governanca-risco-compliance (apetite de risco) | complementa | risco medido só decide quando há apetite declarado |
| 04-identidade-acesso (zero trust) | 05-rede-infraestrutura (segmentação) | complementa | identidade autentica, segmentação contém |
| 04-identidade-acesso (autenticação) | 04-identidade-acesso (autorização) | não confundir | prova quem é versus define o que pode |
| 07-criptografia-segredos (PKI) | 05-rede-infraestrutura (TLS) | aprofundado por | certificado é a identidade da máquina |
| 12-vulnerabilidades-threat-intel (varredura) | 13-ofensiva-pentest (exploração) | não confundir | escala automática versus julgamento humano |
| 12-vulnerabilidades-threat-intel (priorização) | 10-operacoes-soc (triagem) | aplicado em | o que priorizar é o que a triagem persegue |
| 11-resposta-forense (evidência) | 14-dados-privacidade (dado pessoal) | não confundir | coletar evidência não autoriza tratar dado pessoal |
| 08-cloud (responsabilidade compartilhada) | 02-governanca-risco-compliance (contrato) | aplicado em | o modelo define o que precisa ir para o contrato |
| 16-ia-seguranca (prompt injection) | 09-aplicacoes-devsecops (validação de entrada) | aprofundado por | mesma classe de falha, superfície nova |
| 06-endpoint-plataforma (telemetria) | 10-operacoes-soc (detecção) | aplicado em | sem telemetria do endpoint, não há detecção |

## 7. Verificação

`python3 scripts/relacoes.py` valida e regenera `mapa-relacoes.md`.

| Regra | Severidade |
|---|---|
| Alvo inexistente e não marcado `pendente: true` | erro |
| Assimetria em `complementa` ou `nao_confundir_com` | erro |
| Auto-referência | erro |
| `motivo` ausente ou vazio | erro |
| Formato de alvo fora de `area_id#tema_id` | erro |
| Mais de 5 relações no tema | erro |
| Ciclo em `pre_requisitos` | erro |
| Alvo planejado mas ainda não escrito (`pendente: true`) | aviso |
| Tema sem nenhuma relação cross-area | aviso |

## 8. Antipadrões

- **Ligar tudo a tudo.** Cinco relações é teto, não meta. Um tema com cinco ligações fracas vale
  menos que um com duas fortes.
- **Usar `complementa` para esconder desordem de sequência.** Se precisa vir antes, é
  `pre_requisitos`.
- **Motivo genérico.** "Temas relacionados" não é motivo.
- **Relação órfã unilateral.** Declarar `complementa` e não atualizar o outro lado.
- **Ligar por semelhança de nome.** "Ambos falam de nuvem" não é relação; a relação é o que um
  muda na leitura do outro.

---

| Navegação | |
|---|---|
| Esquema do frontmatter | [FRONTMATTER.md](./FRONTMATTER.md) |
| Regras de autoria | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Mapa global | [mapa-relacoes.md](../mapa-relacoes.md) |
