import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export interface Room {
  id: string;
  slug: string;
  userId: string;
}

export default function useFetch(URL: string, token: string | null) {
  const [data, setData] = useState<Room[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(URL, {
        headers: { authorization: token },
      });
      setData(response.data);
    } catch (err) {
      console.error("Error fetching:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
