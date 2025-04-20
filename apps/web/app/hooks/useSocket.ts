import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMTJkOTQzOC1mZTJmLTQ3MjEtYWYyYi1jN2JhYTNhZDY1N2YiLCJpYXQiOjE3NDUxNDc5OTh9.yMS7VvpwdGROJsVtkXPwyFqg4jH3L4eYrSLS33HcZug`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}