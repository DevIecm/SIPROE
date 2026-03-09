import { monitorService } from "../services/monitor.service.js"

export const monitor = async (req, res) => {

    try {
        const result = await monitorService();
        
        res.status(200).json({ registrosMonitor: result});

    } catch (error) {
       return res.status(500).json({ message: "Error de servidor", error: error.message });
    }
}