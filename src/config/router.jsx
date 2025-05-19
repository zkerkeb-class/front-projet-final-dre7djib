import {
    createBrowserRouter,
} from "react-router";
import HomePage from "../screens/HomePage";
import Navbar from "../components/Navbar";
import LoginPage from "../screens/LoginPage";

let router = createBrowserRouter([
    { 
        Component: Navbar,
        children: [
            {
                path: "/",
                Component: HomePage,
            },
            {
                path: "/login",
                Component: LoginPage,
            }  
        ]
    }
]);

export default router;