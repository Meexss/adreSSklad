import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

export const reserveAll = async (shipment) => {
    const reserveRequest = {
        uid_ship: shipment.uid_ship,
        stocks: shipment.stocks.map(stock => ({
            article: stock.article,
            quantity: stock.quantity,
        })),
    };
    return api.post('/api/reserve/', reserveRequest);
};

export const fetchReservedData = async (uid_ship) => {
    return api.get(`/api/reserve/?uid_ship=${uid_ship}`);
};

export const cancelReservation = async (reserve_ids) => {
    return api.post('/api/reserve/cancel/', { reserve_ids });
};

export const updateShipmentProgress = async (uid_ship, progress) => {
    return api.post('/api/shipments/', { uid_ship, progress });
};

export default api;
