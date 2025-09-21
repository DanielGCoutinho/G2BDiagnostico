import React, { useState, useEffect } from "react";
import "./App.css";
import p1 from './personagens/personagem1.png';
import p2 from './personagens/personagem2.png';
import p3 from './personagens/personagem3.png';
import p4 from './personagens/personagem4.png';
import p5 from './personagens/personagem5.png';

// IMPORTANTE: Importa a imagem de background para o formulário
// Certifique-se de que o caminho está correto para onde você salvou a imagem
import formBackgroundImage from './assets/form-background.jpg';
// NOVAS IMPORTAÇÕES DE IMAGENS DO FORMULÁRIO
import G2BImage from './assets/G2B.png'; // Verifique o caminho real da imagem
import QRImage from './assets/QR.png';   // Verifique o caminho real da imagem

// NOVO: Importa a imagem de background para a área de seleção de personagem
import characterBackgroundImage from './assets/character-background.png';
// NOVO: Importa a imagem G2BLogo para a área de seleção de personagem
import G2BLogoImage from './assets/G2BLogo.png';

// NOVO: Importa a imagem de background para a área de perguntas
import questionsBackgroundImage from './assets/questions-background.jpg'; // Crie este arquivo em src/assets

// NOVO: Importa a imagem de background para a área 'done'
import doneBackgroundImage from './assets/done-background.png'; // Crie este arquivo em src/assets, pode ser .jpg também.

const personagens = [p1, p2, p3, p4, p5];

const APPS_SCRIPT_BASE_URL = "https://script.google.com/macros/s/AKfycbz1hh56KOH4e3Xi8qb6sTqf-LmsvK8e5GKDr4VL04ewqc3ocO95mUDIzltPuVPkhQPo/exec";

export default function App() {
  const [orientation, setOrientation] = useState(window.innerWidth > window.innerHeight ? "landscape" : "portrait");
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ nome: "", sobrenome: "", email: "", telefone: "", senha: "", senha2: "" });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(Array(5).fill(0)); // Inicializa com 0, não null
  // NOVO: Estado para armazenar o índice do personagem selecionado
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0); // Padrão 0, será atualizado na seleção
  const [isLoading, setIsLoading] = useState(false); // NOVO: Estado de carregamento

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vTwSymRZrdib5q3ARYofp04XmbMLTocgWAk0dE9UqWG_0lnBC0Ypq4KwyY6fOiLrUlk1ILJga7DzDQi/pub?gid=580807929&single=true&output=csv")
      .then((res) => res.text())
      .then((text) => {
        const rows = text.split("\n").map((r) => r.trim()).filter(Boolean);
        setQuestions(rows);
        setAnswers(Array(rows.length).fill(0)); // Ajusta o array de respostas para o número correto de perguntas
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    // --- INÍCIO DAS VALIDAÇÕES ---
    const fieldNames = { nome: "Nome", sobrenome: "Sobrenome", email: "E-mail", telefone: "Telefone", senha: "Senha", senha2: "Confirme sua senha" };
    for (const key in form) {
      if (form[key].trim() === "") {
        alert(`O campo '${fieldNames[key]}' não pode estar vazio.`);
        return;
      }
    }
    if (!form.email.includes("@")) {
      alert("O campo 'E-mail' deve conter um '@'.");
      return;
    }
    if (!/^\d+$/.test(form.telefone.trim())) {
      alert("O campo 'Telefone' deve conter apenas números.");
      return;
    }
    if (form.senha !== form.senha2) {
      alert("As senhas não conferem.");
      return;
    }
    // --- FIM DAS VALIDAÇÕES ---

    setIsLoading(true); // Inicia o carregamento
    const url = `${APPS_SCRIPT_BASE_URL}?action=appendUser&email=${encodeURIComponent(form.email)}&nome=${encodeURIComponent(form.nome)}&sobrenome=${encodeURIComponent(form.sobrenome)}&telefone=${encodeURIComponent(form.telefone)}&senha=${encodeURIComponent(form.senha)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false); // Finaliza o carregamento
        if (data.status === "ok") setStep("character");
        else alert("Erro ao gravar cadastro. Tente novamente.");
      })
      .catch(() => {
        setIsLoading(false); // Finaliza o carregamento em caso de erro
        alert("Erro de conexão com servidor. Verifique sua conexão.");
      });
  };

  const handleCharacterSelect = () => {
    setIsLoading(true); // Inicia o carregamento
    const personagem = carouselIndex + 1;
    const url = `${APPS_SCRIPT_BASE_URL}?action=updateCharacter&email=${encodeURIComponent(form.email)}&personagem=${personagem}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false); // Finaliza o carregamento
        if (data.status === "ok") {
          setSelectedCharacterIndex(carouselIndex); // Armazena o índice do personagem selecionado
          setStep("questions");
        } else {
          alert("Erro ao selecionar personagem.");
        }
      })
      .catch(() => {
        setIsLoading(false); // Finaliza o carregamento em caso de erro
        alert("Erro de conexão ao selecionar personagem.");
      });
  };

  const handleAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSendAnswers = () => {
    if (answers.some(answer => answer === null || answer === undefined)) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }
    setIsLoading(true); // Inicia o carregamento
    const url = `${APPS_SCRIPT_BASE_URL}?action=appendResponses&email=${encodeURIComponent(form.email)}&q1=${answers[0]}&q2=${answers[1]}&q3=${answers[2]}&q4=${answers[3]}&q5=${answers[4]}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false); // Finaliza o carregamento
        if (data.status === "ok") setStep("done");
        else alert("Erro ao enviar respostas.");
      })
      .catch(() => {
        setIsLoading(false); // Finaliza o carregamento em caso de erro
        alert("Erro de conexão ao enviar respostas.");
      });
  };

  const dynamicBackgroundStyle = {
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (step === "form") {
    dynamicBackgroundStyle.backgroundImage = `url(${formBackgroundImage})`;
    dynamicBackgroundStyle.backgroundColor = 'BLACK';
    dynamicBackgroundStyle.backgroundSize = 'auto 100%'; // Preencher verticalmente
  } else if (step === "character") {
    dynamicBackgroundStyle.backgroundImage = `url(${characterBackgroundImage})`;
    dynamicBackgroundStyle.backgroundColor = 'BLACK';
    dynamicBackgroundStyle.backgroundSize = 'auto 100%'; // Preencher verticalmente
  } else if (step === "questions") {
    dynamicBackgroundStyle.backgroundImage = `url(${questionsBackgroundImage})`;
    dynamicBackgroundStyle.backgroundColor = 'BLACK'; // Cor de fallback
    dynamicBackgroundStyle.backgroundSize = 'auto 100%'; // Preencher verticalmente
  } else if (step === "done") {
    dynamicBackgroundStyle.backgroundImage = `url(${doneBackgroundImage})`;
    dynamicBackgroundStyle.backgroundColor = 'BLACK'; // Cor de fallback
    dynamicBackgroundStyle.backgroundSize = 'auto 100%'; // Preencher verticalmente
  }

  return (
    <div className={`container ${orientation}`}>
      {orientation === "landscape" && <div className="blue">Área Azul</div>}

      <div
        className={`yellow`}
        style={dynamicBackgroundStyle}
      >
        {step === "form" && (
          <>
            <div className="form-element phrase-racing-pass">Teste para Piloto</div>
            <img src={G2BImage} alt="G2B Logo" className="form-image image-g2b" />

            <div className="form-field-group field-nome">
              <span className="field-label">Nome:</span>
              <input name="nome" placeholder="" onChange={handleChange} value={form.nome} className="field-input" />
            </div>
            <div className="form-field-group field-sobrenome">
              <span className="field-label">Sobrenome:</span>
              <input name="sobrenome" placeholder="" onChange={handleChange} value={form.sobrenome} className="field-input" />
            </div>
            <div className="form-field-group field-email">
              <span className="field-label">E-mail:</span>
              <input name="email" placeholder="" onChange={handleChange} value={form.email} className="field-input" />
            </div>
            <div className="form-field-group field-telefone">
              <span className="field-label">Telefone:</span>
              <input name="telefone" placeholder="" type="tel" pattern="[0-9]*" onChange={handleChange} value={form.telefone} className="field-input" />
            </div>
            <div className="form-field-group field-senha">
              <span className="field-label">Senha:</span>
              <input name="senha" type="password" placeholder="" onChange={handleChange} value={form.senha} className="field-input" />
            </div>
            <div className="form-field-group field-senha2">
              <span className="field-label">Confirme:</span>
              <input name="senha2" type="password" placeholder="" onChange={handleChange} value={form.senha2} className="field-input" />
            </div>

            <div className="form-element phrase-destino">Destino: TrustLand</div>
            <div className="form-element phrase-largada">Largada: Imediata</div>

            <img src={QRImage} alt="QR Code" className="form-image image-qr" />
            {isLoading ? (
              <div className="loading-indicator form-button-loading">
                <img src={G2BImage} alt="Loading" className="loading-g2b-image" />
                <span>Carregando...</span>
              </div>
            ) : (
              <button onClick={handleSubmit} className="form-button">Decolar</button>
            )}
            <div className="form-element phrase-valido">Escola para pilotos G2B</div>
          </>
        )}

        {step === "character" && (
          <>
            <img src={G2BLogoImage} alt="G2B Logo" className="character-image image-g2b-logo" />

            {/* Wrapper para o título com o texto interno para animação */}
            <div className="character-title">
              <span className="character-title-inner-text">Escolha seu piloto</span>
            </div>

            <img src={personagens[carouselIndex]} alt={`personagem ${carouselIndex+1}`} className="character-display-image" />
            <div className="character-nav-container">
              <button onClick={() => setCarouselIndex((prevIndex) => (prevIndex - 1 + personagens.length) % personagens.length)} className="character-nav-button" disabled={isLoading}>◀</button>
              <button onClick={() => setCarouselIndex((prevIndex) => (prevIndex + 1) % personagens.length)} className="character-nav-button" disabled={isLoading}>▶</button>
            </div>
            {isLoading ? (
              <div className="loading-indicator character-button-loading">
                <img src={G2BImage} alt="Loading" className="loading-g2b-image" />
                <span>Carregando...</span>
              </div>
            ) : (
              <button onClick={handleCharacterSelect} className="character-select-button">Selecionar</button>
            )}
          </>
        )}

        {step === "questions" && (
          <>
            <h3 className="questions-screen-title">Teste para piloto</h3>

            {/* Círculo do Personagem */}
            <div className="questions-character-circle">
              {selectedCharacterIndex !== null && (
                <img
                  src={personagens[selectedCharacterIndex]}
                  alt="Personagem selecionado"
                  className="questions-character-image"
                />
              )}
            </div>

            {/* Bloco de perguntas e botão */}
            <div className="questions-area">
              {questions.map((q, i) => (
                <div key={i} className="question-item-q-screen">
                  <p>{q}</p>
                  <div className="range-input-wrapper">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers[i] !== null ? answers[i] : 0}
                      onChange={(e) => handleAnswer(i, e.target.value)}
                      disabled={isLoading} // Desabilita o slider durante o carregamento
                    />
                    <span>{answers[i] !== null ? answers[i] : 0}</span>
                  </div>
                </div>
              ))}
              {isLoading ? (
                <div className="loading-indicator questions-button-loading">
                  <img src={G2BImage} alt="Loading" className="loading-g2b-image" />
                  <span>Carregando...</span>
                </div>
              ) : (
                <button onClick={handleSendAnswers} className="questions-send-button">Enviar</button>
              )}
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <div className="done-screen-title">
              Parabéns Capitão {form.nome} {form.sobrenome}, você foi aprovado e já pode pilotar rumo a TrustLand. Feche esta página e aguarde novas instruções!
            </div>

            {/* Círculo do Personagem - Reutiliza os estilos base do círculo de personagem */}
            <div className="questions-character-circle done-character-circle-position">
              {selectedCharacterIndex !== null && (
                <img
                  src={personagens[selectedCharacterIndex]}
                  alt="Personagem selecionado"
                  className="questions-character-image"
                />
              )}
            </div>

            <div className="done-info-block"> {/* Bloco de informações */}
              <p>Capitão {form.nome} {form.sobrenome}</p>
              <p>Licença para pilotar: 18042025G2B</p>
              <p>Emissor: Gamer2Business</p>
              <p>Validade: Indeterminado</p>
             
            </div>

            {/* Bloco para a imagem G2B e texto "LICENÇA PARA PILOTAR" */}
            <div className="done-license-badge">
             <img src={G2BImage} alt="G2B Logo" className="done-license-badge-image" />
             <span className="done-license-badge-text">LICENÇA PILOTO</span>
             <img src={QRImage} alt="G2B Logo" className="done-license-badge-image1" />
            </div>
           
          </>
        )}
      </div>

      {orientation === "landscape" && <div className="green">Área Verde</div>}
    </div>
  );
}