import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ligarMenuDoApp } from './application/progresso-store'
import { App } from './ui/App'
import './styles.css'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('#root ausente no index.html')

// Uma vez so, fora do React: o StrictMode montaria o efeito duas vezes.
ligarMenuDoApp()

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
