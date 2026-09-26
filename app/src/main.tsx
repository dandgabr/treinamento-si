import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ligarMenuDoApp } from './application/progresso-store'
import { carregar } from './infrastructure/content/repository'
import { App } from './ui/App'
import './styles.css'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('#root ausente no index.html')

// Uma vez so, fora do React: o StrictMode montaria o efeito duas vezes.
ligarMenuDoApp()

// O conteudo vem inline (navegador) ou de um arquivo (desktop). Nenhuma tela pode ser
// montada antes disso: os componentes leem `content` na renderizacao.
await carregar()

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
