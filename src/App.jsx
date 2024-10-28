import { Auth0Provider } from '@auth0/auth0-react';
import Routes from './routes';

function App() {

    return (
        <Auth0Provider
        domain="dev-j7pojbx0ascwuo8w.us.auth0.com"
        clientId="qVRua2uMsfo0QhY5SOkR9P35VqhUMwCR"
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
     >
        <Routes />
        </Auth0Provider>
    )
}

export default App
