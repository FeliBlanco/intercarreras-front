import styled from "@emotion/styled";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const MIN_TEMP = 0;
const MAX_TEMP = 10;

const normalise = (value) => ((value - MIN_TEMP) * 100) / (MAX_TEMP - MIN_TEMP);

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

const PouContainer = styled(Box)(() => ({
    border: '4px solid #444',
    width: '400px',
    height: '400px',
    background: '#111',
    borderRadius: '8px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '14px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
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
        scale: [1, 1.05],
        transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
    },
    comiendo: {
        rotate: [0, -5, 5, -5, 0],
        transition: { duration: 1, repeat: Infinity }
    },
    bebiendo: {
        y: [0, -5, 0],
        transition: { duration: 1, repeat: Infinity }
    },
    durmiendo: {
        scale: [1, 1.02],
        transition: { duration: 3, repeat: Infinity, repeatType: "reverse" }
    }
};

export default function Home() {
    const [getEstado, setEstado] = useState({});
    const [getText, setText] = useState('');
    const [getChat, setChat] = useState([]);

    useEffect(() => {
        const socket = io(`${import.meta.env.VITE_APP_API_URL}`);
        socket.on('estado', (data) => {
            setEstado(data);
        });
        return () => socket.disconnect();
    }, []);

    const comerFunction = async () => {
        if(getEstado?.alimentandose) return;
        try {
            await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/comer`);
        } catch(err) {
            console.error(err);
        }
    };

    const beberFunction = async () => {
        if(getEstado?.alimentandose) return;
        try {
            await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/beber`);
        } catch(err) {
            console.error(err);
        }
    };

    const dormirFunction = async () => {
        if(getEstado?.alimentandose || getEstado?.bebiendo) return;
        try {
            if(getEstado?.durmiendo == false) {
                await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/dormir`);
            } else {
                await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/despertarse`);
            }
        } catch(err) {
            console.error(err);
        }
    };

    const hablarle = async () => {
        try {
            const text = getText;
            setText('');
            setChat(i => [...i, {user: 'Yo', text}]);
            const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/hablarle`, {
                text
            });
            const res = response.data;
            setChat(i => [...i, {user: 'Pou', text: res.content}]);
        } catch(err) {
            console.error(err);
        }
    };

    const obtenerEstadoAnimacion = () => {
        if (getEstado?.alimentandose) return "comiendo";
        if (getEstado?.bebiendo) return "bebiendo";
        if (getEstado?.durmiendo) return "durmiendo";
        return "normal";
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
                <Box display="flex" flexDirection="column" sx={{margin: '20px'}} gap="20px">
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
                <motion.div
                    animate={obtenerEstadoAnimacion()}
                    variants={variantesEstado}
                >
                    <PouContainer>
                        <RetroLabel sx={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                            Estado: {getEstado?.state_name}
                        </RetroLabel>
                    </PouContainer>
                </motion.div>
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
            <Box display="flex" gap="10px" mt="20px">
                <StyledButton 
                    as={motion.button}
                    onClick={comerFunction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={getEstado?.alimentandose}
                >
                    {getEstado?.alimentandose ? 'Comiendo...' : 'Comer'}
                </StyledButton>
                <StyledButton 
                    as={motion.button}
                    onClick={beberFunction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={getEstado?.bebiendo}
                >
                    {getEstado?.bebiendo ? 'Bebiendo...' : 'Beber'}
                </StyledButton>
                <StyledButton 
                    as={motion.button}
                    onClick={dormirFunction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={getEstado?.alimentandose || getEstado?.bebiendo}
                >
                    {getEstado?.durmiendo ? 'Despertar' : 'Dormir'}
                </StyledButton>
            </Box>
        </Box>
    );
}