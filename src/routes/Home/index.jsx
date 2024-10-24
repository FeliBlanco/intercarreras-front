import styled from "@emotion/styled";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const MIN_TEMP = 0;
const MAX_TEMP = 10;

const normalise = (value) => ((value - MIN_TEMP) * 100) / (MAX_TEMP - MIN_TEMP);


export default function Home() {

    const [getEstado, setEstado] = useState({})
    const [getText, setText] = useState('')
    const [getChat, setChat] = useState([])

    useEffect(() => {
        const socket = io(`${import.meta.env.VITE_APP_API_URL}`)
        socket.on('estado', (data) => {
            
            setEstado(data)
        })
    }, [])

    const comerFunction = async () => {
        if(getEstado?.alimentandose == true) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/comer`)
        }
        catch(err) {

        }
    }

    const beberFunction = async () => {
        if(getEstado?.alimentandose == true) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/beber`)
        }
        catch(err) {

        }
    }

    const dormirFunction = async () => {
        if(getEstado?.alimentandose == true || getEstado?.bebiendo == true) return;
        try {
            if(getEstado?.durmiendo == false) {
                await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/dormir`)
            } else {
                await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/despertarse`)
            }
        }
        catch(err) {

        }        
    }

    const hablarle = async () => {
        try {
            const text = getText
            setText('')
            setChat(i => [...i, {user: 'Yo', text}])
            const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/pou/hablarle`, {
                text
            })
            const res = response.data
            console.log(res.content)
            setChat(i => [...i, {user: 'Pou', text: res.content}])
        }
        catch(err) {
            console.log(err)
        }
    }
    return (
        <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
            <Box display={"flex"} flexDirection={"row"} gap="20px">
                <Box display="flex" flexDirection={"column"} sx={{margin:'20px'}} gap="20px">
                    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
                        <Typography>Sed</Typography>
                        <CircularProgress variant="determinate" value={getEstado?.sed}/>
                    </Box>
                    <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
                        <Typography>Hambre</Typography>
                        <CircularProgress variant="determinate" value={getEstado?.hambre} sx={{color:'#6acf34'}}/>
                    </Box>
                    <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
                        <Typography>Temperatura</Typography>
                        <CircularProgress variant="determinate" value={normalise(getEstado?.temperatura)} sx={{color:'#6acf34'}}/>
                    </Box>
                </Box>
                <PouContainer>
                    estado: {getEstado?.state_name}
                </PouContainer>
                <ChatContainer>
                    <ChatHeader><Typography>Conversacion</Typography></ChatHeader>
                    <ChatMensajesContainer>

                        {getChat.map((value, index) => <MensajeContainer key={`dsd-${index}`}>{value.user}: {value.text || '-'}</MensajeContainer>)}
                    </ChatMensajesContainer>
                    <ChatInputContainer>
                        <input type="text" value={getText} onChange={(e) => setText(e.target.value)} placeholder="Escribe algo..."/><button onClick={hablarle}>Enviar</button>
                    </ChatInputContainer>
                </ChatContainer>

            </Box>
            <Box>
                <Button variant="contained" onClick={comerFunction}>{getEstado?.alimentandose == true ? 'Comiendo...' : 'Comer'}</Button>
                <Button variant="contained" onClick={beberFunction}>{getEstado?.bebiendo == true ? 'Bebiendo...' : 'Beber'}</Button>
                <Button variant="contained"onClick={dormirFunction}>{getEstado?.durmiendo == true ? 'Despertarse' : 'Dormir'}</Button>
            </Box>
        </Box>
    )
}

const ChatHeader = styled(Box)(() => ({
padding:'12px',
borderBottom: '1px solid #e1e1e1',
background: '#e0e0e0'
}))

const ChatMensajesContainer = styled(Box)(() => ({
    flex:1,
    overflowY:'scroll',
    background:'#f0f0f0'
}))
const ChatInputContainer = styled(Box)(() => ({
    display:'flex',
    input:{
        flex:1,
        padding:'4px'
    }
}))

const MensajeContainer = styled(Box)(() => ({
    padding:'20px'
}))

const ChatContainer = styled(Box)(() => ({
    width:'300px',
    height:'500px',
    border:'1px solid #e1e1e1',
    display:'flex',
    flexDirection:'column',
    borderRadius:'2px',
    overflow:'hidden'
}))

const PouContainer = styled(Box)(() => ({
    border:'1px solid #e1e1e1',
    width:'400px',
    height:'400px'
}))