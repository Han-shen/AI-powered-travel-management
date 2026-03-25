import { useEffect, useState } from "react";
import api from "../services/api";

export function useTrips() {
  const [trips, setTrips] = useState([]);

  const fetchTrips = async () => {
    const { data } = await api.get("/trips");
    setTrips(data);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return { trips, fetchTrips };
}
