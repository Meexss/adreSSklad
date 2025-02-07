import { useState, useEffect, useCallback } from 'react';
import { fetchReservedData, reserveAll, cancelReservation, updateShipmentProgress } from './api';

const useShipment = (initialShipment) => {
    const [shipment, setShipment] = useState(initialShipment);
    const [reservedData, setReservedData] = useState([]);
    const [showReservedData, setShowReservedData] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!shipment) return;

        setLoading(true);
        fetchReservedData(shipment.uid_ship)
            .then(response => {
                setReservedData(response.data);
                setShowReservedData(true);
            })
            .catch(err => {
                if (err.response?.status !== 404) {
                    setError("Ошибка загрузки данных");
                }
            })
            .finally(() => setLoading(false));
    }, [shipment]);

    const handleReserveAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setMessage("");

            await reserveAll(shipment);
            await updateShipmentProgress(shipment.uid_ship, "В работе");

            setMessage("Резервирование успешно завершено.");
            const response = await fetchReservedData(shipment.uid_ship);
            setReservedData(response.data);
            setShowReservedData(true);
        } catch (err) {
            setError("Ошибка при резервировании");
        } finally {
            setLoading(false);
        }
    }, [shipment]);

    const handleMassCancelReservation = useCallback(async () => {
        try {
            setLoading(true);
            await cancelReservation(reservedData.map(item => item.unique_id));
            setReservedData([]);
            setShowReservedData(false);
            await updateShipmentProgress(shipment.uid_ship, "Черновик");
        } catch (err) {
            setError("Ошибка при массовой отмене");
        } finally {
            setLoading(false);
        }
    }, [reservedData, shipment?.uid_ship]);

    return {
        shipment,
        reservedData,
        showReservedData,
        message,
        loading,
        error,
        handleReserveAll,
        handleMassCancelReservation,
    };
};

export default useShipment;
