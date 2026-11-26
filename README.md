# 🌦️ CYBER-WEATHER 2077 // Atmosfera Global

Central meteorológica futurista inspirada na estética **Cyberpunk 2077**, construída com **HTML5, CSS3 e JavaScript puro**. O sistema consulta dados meteorológicos reais em tempo real sem necessidade de chave de API, adapta o tema visual conforme o clima/período do dia e exibe projeções horárias, coordenadas geográficas, bandeiras dos países e monumentos holográficos laterais.

## ✨ Funcionalidades

- **Intro Cinematográfica 2077:** Tela inicial com grade em perspectiva, linha de varredura (*scanline*), efeito *glitch* no título, digitação automática e opção de pular ou rever a introdução.
- **Áudio Sintetizado Nativo (Web Audio API):** Efeitos sonoros futuristas de inicialização e escaneamento gerados no próprio navegador, sem dependência de arquivos de áudio externos.
- **Busca Inteligente com Bandeiras:** Consulta a API de Geocoding da Open-Meteo exibindo sugestões com bandeiras dos países (via FlagCDN) para evitar ambiguidades entre cidades.
- **Telemetria em Tempo Real:** Exibe temperatura atual, sensação térmica, umidade relativa, velocidade do vento, período local (dia/noite) e coordenadas (`LAT` / `LON`).
- **Projeção das Próximas 6 Horas:** Cards dinâmicos com previsão hora a hora a partir do horário local da cidade selecionada.
- **Clima Reativo + Monumentos Holográficos:** Efeito de chuva animada e mudança de paleta conforme a condição climática, acompanhados por silhuetas SVG holográficas de monumentos icônicos por país.

## 🛠️ Tecnologias Utilizadas

- **HTML5** — Estrutura semântica da interface e camadas visuais.
- **CSS3** — Variáveis CSS, `clip-path` chanfrado, animações de *glitch*/varredura e layout responsivo.
- **JavaScript (ES6+)** — Consumo de APIs com `fetch` e `async/await`, manipulação dinâmica do DOM e **Web Audio API**.
- **APIs Públicas:**
  - [Open-Meteo Geocoding & Forecast API](https://open-meteo.com/) (dados geográficos e meteorológicos gratuitos).
  - [FlagCDN](https://flagcdn.com/) (bandeiras por código de país).
