import {
    createBrowserRouter,
} from "react-router";
import Layout from "../components/Layout";
import HomePage from "../screens/HomePage";

let router = createBrowserRouter([
    { 
        Component: Layout,
        children: [{
        path: "/",
        Component: HomePage,
        }]
    }
]);

export default router;