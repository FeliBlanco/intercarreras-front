import { Box, Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";


export default function Login() {

    const { loginWithRedirect } = useAuth0();

    return (
        <Box sx={{width:'100%', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
            <Button variant="contained" onClick={loginWithRedirect}>Iniciar sesión con Auth0</Button>
        </Box>
    )
}