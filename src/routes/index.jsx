import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";


import Home from './Home'
import Login from './Login';
import LoguedRoute from '../../LoguedRoute';
import UnloguedRoute from '../../UnloguedRoute';


const router = createBrowserRouter([
    {
        path: '/',
        element: <LoguedRoute><Home /></LoguedRoute>
    },
    {
        path: '/login',
        element: <UnloguedRoute><Login /></UnloguedRoute>
    }
])

function Routes({children}) {
    const { isLoading } = useAuth0();

    if(isLoading) return <div>Loading...</div>


    return (
        <RouterProvider router={router}>{children}</RouterProvider>
    )
}

export default Routes
