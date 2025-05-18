import {
    createBrowserRouter,
} from "react-router";
import HomePage from "../screens/HomePage";
import Navbar from "../components/Navbar";

let router = createBrowserRouter([
    { 
        Component: Navbar,
        children: [{
        path: "/",
        Component: HomePage,
        }]
    }
]);

export default router;