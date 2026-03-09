import { getMonitor } from "../repository/monitor.repository.js";

export const monitorService = async() => {
    const data = await getMonitor();

    if(!data || data.length === 0) {
        throw new Error("No se encontraron datos");
    }

    return data;
}