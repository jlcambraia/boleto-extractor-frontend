import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState('');
	const [history, setHistory] = useState([]);
	const [showHistory, setShowHistory] = useState(false);
	const [showPopup, setShowPopup] = useState(false);
	const [popupMessage, setPopupMessage] = useState('');
	const [warningPopup, setWarningPopup] = useState(false);

	const fileInputRef = useRef(null);
	const dropZoneRef = useRef(null);

	// Carregar histórico do localStorage ao inicializar
	useEffect(() => {
		loadHistoryFromStorage();
	}, []);

	// Carregar o Warning popup

	useEffect(() => {
		handleOpenWarningPopup();
	}, []);

	// Função para abrir o popup de aviso
	const handleOpenWarningPopup = () => {
		setWarningPopup(true);
	};

	// Função para fechar o popup de aviso
	const handleCloseWarningPopup = () => {
		setWarningPopup(false);
	};

	// Função para fechar o popup de aviso clicando no overlay
	const handleOverlayClick = (evt) => {
		if (evt.target.classList.contains('warning-popup-overlay')) {
			handleCloseWarningPopup();
		}
	};

	// Função para fechar o popup de aviso ao apertar a tecla Esc

	useEffect(() => {
		const handleEscClose = (evt) => {
			if (evt.key === 'Escape') {
				if (document.activeElement) {
					document.activeElement.blur();
				}
				handleCloseWarningPopup();
			}
		};

		document.addEventListener('keydown', handleEscClose);
		return () => {
			document.removeEventListener('keydown', handleEscClose);
		};
	}, [handleCloseWarningPopup]);

	// Função para carregar histórico do localStorage
	const loadHistoryFromStorage = () => {
		try {
			const savedHistory = localStorage.getItem('boleto-history');
			if (savedHistory) {
				setHistory(JSON.parse(savedHistory));
			}
		} catch (error) {
			console.error('Erro ao carregar histórico:', error);
		}
	};

	// Função para salvar no localStorage
	const saveToHistory = (extractionData) => {
		try {
			const historyItem = {
				originalName: extractionData.originalName,
				barcode: extractionData.barcode,
				extractedAt: extractionData.extractedAt,
				fileSize: extractionData.fileSize,
				id: Date.now(), // ID único para cada item
			};

			const currentHistory = JSON.parse(
				localStorage.getItem('boleto-history') || '[]'
			);
			const updatedHistory = [historyItem, ...currentHistory].slice(0, 50); // Limita a 50 itens

			localStorage.setItem('boleto-history', JSON.stringify(updatedHistory));
			setHistory(updatedHistory);
		} catch (error) {
			console.error('Erro ao salvar no histórico:', error);
		}
	};

	// Função para mostrar popup
	const showPopupMessage = (message) => {
		setPopupMessage(message);
		setShowPopup(true);
		setTimeout(() => {
			setShowPopup(false);
		}, 3000);
	};

	// Função para lidar com seleção de arquivo
	const handleFileSelect = (selectedFile) => {
		if (selectedFile && selectedFile.type === 'application/pdf') {
			setFile(selectedFile);
			setError('');
			setResult(null);
		} else {
			setError('Por favor, selecione apenas arquivos PDF.');
		}
	};

	// Eventos de drag and drop
	const handleDragOver = (e) => {
		e.preventDefault();
		dropZoneRef.current.classList.add('drag-over');
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		dropZoneRef.current.classList.remove('drag-over');
	};

	const handleDrop = (e) => {
		e.preventDefault();
		dropZoneRef.current.classList.remove('drag-over');

		const droppedFile = e.dataTransfer.files[0];
		handleFileSelect(droppedFile);
	};

	// Função para processar o arquivo
	const processFile = async () => {
		if (!file) {
			setError('Por favor, selecione um arquivo PDF.');
			return;
		}

		setLoading(true);
		setError('');

		const formData = new FormData();
		formData.append('boleto', file);

		try {
			const response = await axios.post(
				`${API_BASE_URL}/api/extract-barcode`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			setResult(response.data);
			// Salvar no histórico
			saveToHistory(response.data);
		} catch (err) {
			if (
				err.response?.status === 401 &&
				err.response?.data?.isPasswordProtected
			) {
				setError(
					'Este PDF está protegido por senha ou criptografado. Este aplicativo não suporta PDFs com senha. Por favor, use um PDF sem proteção.'
				);
			} else if (err.response?.status === 404) {
				setError(
					'Código de barras não encontrado no documento. Verifique se o arquivo é um boleto válido.'
				);
			} else {
				setError(
					err.response?.data?.error ||
						'Erro ao processar o arquivo. Tente novamente.'
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// Função para copiar código de barras
	const copyBarcode = async (barcode) => {
		if (barcode) {
			try {
				await navigator.clipboard.writeText(barcode);
				showPopupMessage(
					'Código de barras copiado para a área de transferência!'
				);
			} catch (err) {
				// Fallback para navegadores mais antigos
				const textArea = document.createElement('textarea');
				textArea.value = barcode;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				showPopupMessage(
					'Código de barras copiado para a área de transferência!'
				);
			}
		}
	};

	// Função para limpar histórico
	const clearHistory = () => {
		localStorage.removeItem('boleto-history');
		setHistory([]);
		showPopupMessage('Histórico limpo com sucesso!');
	};

	// Função para resetar o formulário
	const resetForm = () => {
		setFile(null);
		setResult(null);
		setError('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className='App'>
			{/* Popup de aviso */}
			{warningPopup && (
				<div className='warning-popup-overlay' onClick={handleOverlayClick}>
					<div className='warning-popup-box'>
						<div className='warning-popup-header'>
							<h3>Aviso sobre desempenho da Api</h3>
							<button
								className='warning-close-popup'
								onClick={handleCloseWarningPopup}
							>
								×
							</button>
						</div>
						<div className='warning-popup-body'>
							<p className='warning-popup-text'>
								A API responsável por Registro, Login e Salvamento de Artigos
								está hospedada em um servidor gratuito que{' '}
								<span className='warning-popup-font-weight_bold'>
									pode entrar em hibernação após um período de inatividade.
								</span>
								<span className='warning-popup-paragraph'>
									Por isso, o tempo de resposta na{' '}
									<span className='warning-popup-font-weight_bold'>
										primeira utilização
									</span>{' '}
									(como durante o registro) pode ser mais lento. Após esse
									primeiro acesso, a API volta a responder normalmente.
								</span>
								<span className='warning-popup-paragraph'>
									Já a API utilizada para{' '}
									<span className='warning-popup-font-weight_bold'>
										busca de artigos
									</span>{' '}
									é fornecida por terceiros e permanece ativa continuamente,
									garantindo respostas rápidas desde o início.
								</span>{' '}
								<span className='warning-popup-font-weight_bold warning-popup-paragraph'>
									Agradeço a todos pela compreensão.
								</span>
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Popup de notificação */}
			{showPopup && (
				<div className='popup-notification'>
					<div className='popup-content'>
						<span className='popup-icon'>✅</span>
						<span className='popup-message'>{popupMessage}</span>
					</div>
				</div>
			)}

			<header className='App-header'>
				<div className='container'>
					<h1>📄 Extrator de Código de Barras</h1>
					<p className='subtitle'>
						Faça upload do seu boleto em PDF e extraia o código de barras para
						pagamento
					</p>
				</div>
			</header>

			<main className='main-content'>
				<div className='container'>
					{/* Área de Upload */}
					<div className='upload-section'>
						<div
							className={`drop-zone ${file ? 'has-file' : ''}`}
							ref={dropZoneRef}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								type='file'
								ref={fileInputRef}
								accept='.pdf'
								onChange={(e) => handleFileSelect(e.target.files[0])}
								style={{ display: 'none' }}
							/>

							{file ? (
								<div className='file-selected'>
									<div className='file-icon'>📄</div>
									<div className='file-info'>
										<p className='file-name'>{file.name}</p>
										<p className='file-size'>
											{(file.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
									<button
										className='remove-file'
										onClick={(e) => {
											e.stopPropagation();
											resetForm();
										}}
									>
										✕
									</button>
								</div>
							) : (
								<div className='drop-zone-content'>
									<div className='upload-icon'>📁</div>
									<p className='drop-text'>
										Clique aqui ou arraste seu boleto PDF
									</p>
									<p className='drop-subtext'>
										Apenas arquivos PDF são aceitos (máx. 10MB)
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Botão de processar */}
					<div className='action-section'>
						<button
							className='process-btn'
							onClick={processFile}
							disabled={!file || loading}
						>
							{loading ? (
								<>
									<span className='spinner'></span>
									Processando...
								</>
							) : (
								<>🔍 Extrair Código de Barras</>
							)}
						</button>
					</div>

					{/* Mensagem de erro */}
					{error && (
						<div className='error-message'>
							<span className='error-icon'>⚠️</span>
							{error}
						</div>
					)}

					{/* Resultado */}
					{result && (
						<div className='result-section'>
							<div className='result-card'>
								<h3>✅ Código de Barras Extraído!</h3>
								<div className='barcode-display'>
									<p className='barcode-label'>Código de Barras:</p>
									<div className='barcode-value'>
										<span className='barcode-text'>{result.barcode}</span>
									</div>
								</div>
								<div className='result-actions'>
									<button
										className='copy-btn'
										onClick={() => copyBarcode(result.barcode)}
									>
										📋 Copiar Código
									</button>
									<button className='new-file-btn' onClick={resetForm}>
										📄 Novo Arquivo
									</button>
								</div>
								<div className='result-info'>
									<p>
										<strong>Arquivo:</strong> {result.originalName}
									</p>
									<p>
										<strong>Extraído em:</strong>{' '}
										{new Date(result.extractedAt).toLocaleString('pt-BR')}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Botão de histórico */}
					<div className='history-section'>
						<button
							className='history-btn'
							onClick={() => setShowHistory(true)}
						>
							📊 Ver Histórico ({history.length})
						</button>
					</div>

					{/* Modal de histórico */}
					{showHistory && (
						<div
							className='modal-overlay'
							onClick={() => setShowHistory(false)}
						>
							<div
								className='modal-content'
								onClick={(e) => e.stopPropagation()}
							>
								<div className='modal-header'>
									<h3>📊 Histórico de Extrações</h3>
									<div className='modal-header-actions'>
										{history.length > 0 && (
											<button
												className='clear-history-btn'
												onClick={clearHistory}
												title='Limpar histórico'
											>
												🗑️
											</button>
										)}
										<button
											className='close-modal'
											onClick={() => setShowHistory(false)}
										>
											✕
										</button>
									</div>
								</div>
								<div className='modal-body'>
									{history.length > 0 ? (
										<div className='history-list'>
											{history.map((item) => (
												<div key={item.id} className='history-item'>
													<div className='history-info'>
														<p className='history-file'>{item.originalName}</p>
														<p className='history-date'>
															{new Date(item.extractedAt).toLocaleString(
																'pt-BR'
															)}
														</p>
													</div>
													<div className='history-barcode'>
														<span>{item.barcode}</span>
														<button
															className='copy-history-btn'
															onClick={() => copyBarcode(item.barcode)}
															title='Copiar código de barras'
														>
															📋
														</button>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className='no-history'>Nenhum histórico encontrado.</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</main>

			<footer className='App-footer'>
				<div className='container'>
					<p>© 2025 João Luiz Cambraia - Extrator de Código de Barras</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
