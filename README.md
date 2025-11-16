# 🌦️ **Aplicativo Clima — Dashboard Moderno de Previsão do Tempo**
### Interface premium • Layout responsivo • Busca inteligente • API OpenWeather  
<br>

🔗 **Acesse o projeto:**  
➡️ https://gustavomurai.github.io/Aplicativo-Clima/

---

## 🖼️ **Demonstração**

> *(Se quiser, posso gerar um GIF bonito do seu projeto.)*

---

## 📌 **Sobre o Projeto**

O **Aplicativo Clima** é um painel moderno de previsão do tempo, totalmente responsivo, feito para oferecer:

- Experiência fluida  
- Visual premium  
- Acesso rápido às informações mais importantes  
- Uso inteligente da OpenWeather API  
- Navegação completa com sidebar e modo mobile (menu deslizante)

Desenvolvido usando **HTML, CSS e JavaScript puro**, com foco em **UI/UX, responsividade e desempenho**.

---

## 🚀 **Principais Funcionalidades**

### 🔍 **Busca Inteligente**
- Autocomplete com OpenWeather Geo API  
- Sugestões instantâneas  
- Seleção rápida da cidade  

### 🌡️ **Clima Atual**
- Temperatura  
- Sensação térmica  
- Umidade  
- Vento  
- Condições climáticas  
- Ícone dinâmico  

### 🕒 **Previsão por Hora**
- Próximas 8 horas  
- Horários localizados  
- Ícones e temperaturas  

### 📅 **Previsão Semanal**
- Mínima e máxima  
- Descrição  
- Ícone correspondente  

### ⭐ **Cidades Favoritas**
- Salvamento automático  
- Remoção ágil  
- Persistência via LocalStorage  

### 🧭 **Mapa**
- Utiliza OpenStreetMap  
- Centralizado na última cidade pesquisada  

### 🎨 **Configurações**
- Tema claro/escuro  
- Unidade: °C / °F  
- Preferências salvas no navegador  

---

## 📱 **Responsividade (Mobile, Tablet e Desktop)**

- **Menu lateral fixo no desktop**  
- **Menu deslizante no mobile**, com:
  - Botão flutuante lateral (bolinha/seta)  
  - Overlay escuro  
  - Sidebar reaproveitada  
- Layout reorganizado no mobile:
  - Cards em coluna  
  - “Condição do ar” em **grade 2x2**  
  - Ícones e textos otimizados para telas pequenas  
- Layout centralizado e consistente  

---

## 🗂️ **Arquitetura das Páginas**

| Página | Função |
|-------|--------|
| `index.html` | Dashboard principal |
| `cities.html` | Cidades favoritas |
| `map.html` | Mapa da última cidade |
| `settings.html` | Preferências do usuário |
| `script.js` | Lógica do app, APIs e interações |
| `style.css` | Estilização e responsividade |
| `images/` | Ícones e elementos visuais |

---

## 🧠 **Tecnologias Utilizadas**

| Tecnologia | Papel |
|-----------|--------|
| **HTML5** | Estrutura |
| **CSS3** | UI, responsividade, animações |
| **JavaScript Vanilla** | Lógica e integração de APIs |
| **OpenWeather API** | Dados climáticos |
| **OpenStreetMap** | Mapa |
| **LocalStorage** | Persistência local |

---

## 📦 **Como Rodar o Projeto Localmente**

```bash
# Clone o repositório
git clone https://github.com/gustavomurai/Aplicativo-Clima

# Acesse a pasta
cd Aplicativo-Clima

# Abra o projeto no navegador
open index.html
