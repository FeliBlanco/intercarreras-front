import styled from "@emotion/styled";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const MIN_TEMP = 0;
const MAX_TEMP = 10;

const ESTADOS = {
    1: "normal",
    2: "durmiendo",
    3: "hambriento",
    4: "feliz",
    5: "triste",
    6: "enojado",
    7: "sediento",
    8: "muerto"
};

const normalise = (value) => ((value - MIN_TEMP) * 100) / (MAX_TEMP - MIN_TEMP);

const ConsolaContainer = styled(Box)(() => ({
    width: '512px',
    border: '8px solid #444',
    borderRadius: '8px',
    backgroundColor: '#111',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.7)',
    position: 'relative'
}));

const PantallaGif = styled(Box)(() => ({
    width: '100%',
    height: '256px',
    border: '4px solid #444',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}));

const EstadoGif = styled('img')(() => ({
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain'
}));

const EstadoLabel = styled(Typography)(() => ({
    fontFamily: "'Press Start 2P', cursive",
    color: '#fff',
    fontSize: '14px',
    padding: '8px 16px',
    textAlign: 'center',
    backgroundColor: '#000',
    border: '2px solid #444',
    borderRadius: '4px',
    margin: '10px 0',
    width: '100%'
}));

const BotonesContainer = styled(Box)(() => ({
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    padding: '10px',
    borderTop: '2px solid #444'
}));

const StyledButton = styled(motion.button)(() => ({
    fontFamily: "'Press Start 2P', cursive",
    backgroundColor: '#444',
    color: 'white',
    border: '2px solid #666',
    padding: '8px 16px',
    cursor: 'pointer',
    boxShadow: 'inset -2px -2px 0px #000',
    borderRadius: '4px',
    fontSize: '12px',
    minWidth: '80px',
    height: '36px',
    '&:hover': {
        backgroundColor: '#555'
    },
    '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
    }
}));

const ChatHeader = styled(Box)(() => ({
    padding: '12px',
    borderBottom: '4px solid #444',
    background: '#333'
}));

const ChatMensajesContainer = styled(Box)(() => ({
    flex: 1,
    overflowY: 'scroll',
    background: '#111',
    padding: '10px',
    '&::-webkit-scrollbar': {
        width: '8px'
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#444',
        borderRadius: '4px'
    }
}));

const ChatInputContainer = styled(Box)(() => ({
    display: 'flex',
    padding: '10px',
    background: '#333',
    gap: '10px',
    borderTop: '4px solid #444',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
}));

const ChatInput = styled('input')(() => ({
    width: '60%',
    padding: '8px',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '12px',
    background: '#111',
    border: '2px solid #444',
    color: '#fff',
    borderRadius: '4px',
    marginRight: '10px'
}));

const ChatSendButton = styled(StyledButton)(() => ({
    width: '35%',
    padding: '8px',
    fontSize: '10px',
    minWidth: 'unset',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
    color: 'white',
    border: '2px solid #666',
    borderRadius: '4px',
    cursor: 'pointer'
}));

const MensajeContainer = styled(Box)(() => ({
    padding: '10px',
    marginBottom: '8px',
    background: '#222',
    border: '2px solid #444',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '12px'
}));

const ChatContainer = styled(Box)(() => ({
    width: '300px',
    height: '500px',
    border: '4px solid #444',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#222'
}));

const RetroLabel = styled(Typography)(() => ({
    fontFamily: "'Press Start 2P', cursive !important",
    color: '#fff',
    fontSize: '14px',
    padding: '10px 20px',
    textAlign: 'center',
    width: 'fit-content'
}));

const variantesEstado = {
    normal: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
        }
    },
    comiendo: {
        rotate: [-5, 5, -5],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
        }
    },
    bebiendo: {
        y: [-5, 0, -5],
        transition: {
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
        }
    },
    durmiendo: {
        scale: [1, 1.02, 1],
        transition: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
        }
    },
    muerto: {
        rotate: 90,
        scale: 0.95,
        transition: {
            duration: 0.5
        }
    }
};

export default function Home() {
    const [getEstado, setEstado] = useState({});
    const [getText, setText] = useState('');
    const [getChat, setChat] = useState([]);

    useEffect(() => {
        console.group('🔍 Monitor de Estado Pou');
        console.log('Estado actual:', {
            hambre: getEstado?.hambre || 'No disponible',
            sed: getEstado?.sed || 'No disponible',
            temperatura: getEstado?.temperatura || 'No disponible',
            estadoNombre: ESTADOS[getEstado?.estado] || "normal",
            estadoNumerico: getEstado?.estado || 1,
            acciones: {
                alimentandose: getEstado?.alimentandose || false,
                bebiendo: getEstado?.bebiendo || false,
                durmiendo: getEstado?.durmiendo || false,
                muerto: getEstado?.muerto || false
            }
        });
        console.groupEnd();
    }, [getEstado]);

    useEffect(() => {
        const socket = io(`${import.meta.env.VITE_APP_API_URL}`);

        socket.on('connect', () => {
            console.log('🔌 Socket conectado');
        });

        socket.on('estado', (data) => {
            console.log('📦 Datos recibidos del socket:', data);
            const estadoProcesado = {
                ...data,
                estadoNombre: ESTADOS[data.estado] || "normal",
                estadoNumerico: data.estado
            };
            setEstado(estadoProcesado);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket desconectado');
        });

        socket.on('error', (error) => {
            console.error('❌ Error en el socket:', error);
        });

        return () => {
            console.log('🔌 Limpiando conexión del socket');
            socket.disconnect();
        };
    }, []);

    const comerFunction = async () => {
        if(getEstado?.durmiendo == true) return;
        if (getEstado?.alimentandose || getEstado?.bebiendo) {
            console.log('⚠️ Acción comer cancelada: Ya está comiendo');
            return;
        }
        try {
            console.log('🍽️ Iniciando acción comer');
            await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/comer`);
            console.log('✅ Acción comer completada');
        } catch (err) {
            console.error('❌ Error en acción comer:', err);
        }
    };

    const beberFunction = async () => {
        if(getEstado?.durmiendo == true) return;
        if (getEstado?.alimentandose || getEstado?.bebiendo) {
            console.log('⚠️ Acción beber cancelada: Ya está alimentándose');
            return;
        }
        try {
            console.log('🥤 Iniciando acción beber');
            await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/beber`);
            console.log('✅ Acción beber completada');
        } catch (err) {
            console.error('❌ Error en acción beber:', err);
        }
    };

    const dormirFunction = async () => {
        if (getEstado?.alimentandose || getEstado?.bebiendo) {
            console.log('⚠️ Acción dormir cancelada: Está comiendo o bebiendo');
            return;
        }
        try {
            console.log('💤 Iniciando acción dormir/despertar');
            if (getEstado?.durmiendo == false) {
                await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/dormir`);
                console.log('✅ Pou se fue a dormir');
            } else {
                await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/despertarse`);
                console.log('✅ Pou se despertó');
            }
        } catch (err) {
            console.error('❌ Error en acción dormir/despertar:', err);
        }
    };

    const revivirFunction = async () => {
        try {
            console.log('🔄 Iniciando acción revivir');
            await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/revivir`);
            console.log('✅ Pou ha sido revivido');
        } catch (err) {
            console.error('❌ Error al revivir a Pou:', err);
        }
    };

    const hablarle = async () => {
        try {
            console.log('💭 Iniciando conversación');
            const text = getText;
            setText('');
            setChat(i => [...i, { user: 'Yo', text }]);
            const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/hablarle`, {
                text
            });
            const res = response.data;
            console.log('✅ Respuesta recibida:', res);
            setChat(i => [...i, { user: 'Buggy', text: res.content }]);
        } catch (err) {
            console.error('❌ Error en la conversación:', err);
        }
    };

    const obtenerEstadoAnimacion = () => {
        if (getEstado?.muerto) return "muerto";
        if (getEstado?.alimentandose) return "comiendo";
        if (getEstado?.bebiendo) return "bebiendo";
        if (getEstado?.durmiendo) return "durmiendo";
        return "normal";
    };

    const obtenerGifEstado = () => {
        if (getEstado?.muerto) return "/images/muerto.png";
        if (getEstado?.alimentandose) return "/images/riendo.gif";
        if (getEstado?.bebiendo) return "/images/riendo.gif";
        if (getEstado?.durmiendo) return "/images/duerme.gif";

        switch (getEstado?.estado) {
            case 1: return "/images/normal.gif";
            case 2: return "/images/duerme.gif";
            case 3: return "/images/hambriento.gif";
            case 4: return "/images/riendo.gif";
            case 5: return "/images/triste.gif";
            case 6: return "/images/enojado.gif";
            case 7: return "/images/triste.gif";
            case 8: return "/images/muerto.png";
            default: return "/images/normal.gif";
        }
    };

    return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"
            sx={{
                minHeight: '100vh',
                background: 'url("/fondo-pixelado.png") repeat',
                padding: '20px'
            }}
        >
            <Box display="flex" flexDirection="row" gap="20px"
                sx={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '4px solid #555'
                }}
            >
                <Box display="flex" flexDirection="column" sx={{ margin: '20px' }} gap="20px">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <RetroLabel>Sed</RetroLabel>
                        <CircularProgress
                            variant="determinate"
                            value={getEstado?.sed}
                            sx={{
                                color: '#3498db',
                                width: '50px !important',
                                height: '50px !important',
                                borderRadius: '50%',
                                backgroundColor: 'black',
                                padding: '5px',
                                boxShadow: '0 0 15px rgba(52, 152, 219, 0.7)'
                            }}
                        />
                    </Box>
                    <Box display="flex" alignItems="center" flexDirection="column">
                        <RetroLabel>Hambre</RetroLabel>
                        <CircularProgress
                            variant="determinate"
                            value={getEstado?.hambre}
                            sx={{
                                color: '#2ecc71',
                                width: '50px !important',
                                height: '50px !important',
                                borderRadius: '50%',
                                backgroundColor: 'black',
                                padding: '5px',
                                boxShadow: '0 0 15px rgba(46, 204, 113, 0.7)'
                            }}
                        />
                    </Box>
                    <Box display="flex" alignItems="center" flexDirection="column">
                        <RetroLabel>Temperatura</RetroLabel>
                        <CircularProgress
                            variant="determinate"
                            value={normalise(getEstado?.temperatura)}
                            sx={{
                                color: '#e74c3c',
                                width: '50px !important',
                                height: '50px !important',
                                borderRadius: '50%',
                                backgroundColor: 'black',
                                padding: '5px',
                                boxShadow: '0 0 15px rgba(231, 76, 60, 0.7)'
                            }}
                        />
                    </Box>
                </Box>

                <ConsolaContainer>
                    <PantallaGif>
                        <EstadoGif
                            src={obtenerGifEstado()}
                            alt={`Estado: ${getEstado?.estadoNombre}`}
                        />
                    </PantallaGif>

                    <EstadoLabel>
                        Estado: {getEstado?.estadoNombre || 'normal'}
                    </EstadoLabel>
                    <BotonesContainer>
                        <StyledButton
                            onClick={comerFunction}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={getEstado?.alimentandose || getEstado?.muerto}
                        >
                            {getEstado?.alimentandose ? 'Comiendo...' : 'Comer'}
                        </StyledButton>
                        <StyledButton
                            onClick={beberFunction}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={getEstado?.bebiendo || getEstado?.muerto}
                        >
                            {getEstado?.bebiendo ? 'Bebiendo...' : 'Beber'}
                        </StyledButton>
                        <StyledButton
                            onClick={dormirFunction}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={getEstado?.alimentandose || getEstado?.bebiendo || getEstado?.muerto}
                        >
                            {getEstado?.durmiendo ? 'Despertar' : 'Dormir'}
                        </StyledButton>
                        {getEstado?.muerto && (
                            <StyledButton
                                onClick={revivirFunction}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    backgroundColor: '#e74c3c',
                                    animation: 'pulse 2s infinite'
                                }}
                            >
                                Revivir
                            </StyledButton>
                        )}
                    </BotonesContainer>
                </ConsolaContainer>
                <ChatContainer>
                    <ChatHeader>
                        <RetroLabel>Conversación</RetroLabel>
                    </ChatHeader>
                    <ChatMensajesContainer>
                        <AnimatePresence>
                            {getChat.map((value, index) => (
                                <motion.div
                                    key={`mensaje-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MensajeContainer>
                                        {value.user}: {value.text || '-'}
                                    </MensajeContainer>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </ChatMensajesContainer>
                    <ChatInputContainer>
                        <ChatInput
                            type="text"
                            value={getText}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && hablarle()}
                            placeholder="Escribe algo..."
                        />
                        <ChatSendButton
                            onClick={hablarle}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Enviar
                        </ChatSendButton>
                    </ChatInputContainer>
                </ChatContainer>
            </Box>
        </Box>
    );
}