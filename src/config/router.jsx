import {
    createBrowserRouter,
} from "react-router";
import HomePage from "../screens/HomePage";
import Navbar from "../components/Navbar";
import LoginPage from "../screens/LoginPage";
import SignUpPage from "../screens/SignUpPage";
import MapPage from "../screens/MapPage";

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
            },
            {
                path: "/signup",
                Component: SignUpPage,
            },
            {
                path: "/map",
                Component: MapPage,
            },
            {
                path: "/map/:id",
                Component: MapPage,
            }
        ]
    }
]);

export default router;