import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom"
import axios from "axios";

export default function NotificationButton() {
  const navigate = useNavigate();

const token = localStorage.getItem('token');
const headers = useMemo(() => ({Authorization: `Bearer ${token}`}), [token]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const endpoint = '/api/points/incidents/active';
  const refreshInterval = 60000; // Rafraîchir toutes les 60 secondes
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoint, { headers });
      //setData(response.data);
      setCount(response.data.total);
      setError(null);
    } catch (err) {
      console.error(err);
      //setError("");
    } finally {
      setLoading(false);
    }
  }, [endpoint, headers]);

  useEffect(() => {
    fetchData();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, refreshInterval, fetchData]);

  if (loading) return <div>Chargement...</div>;
    if (error) return <div>{error}</div>;

  return (

 <Button onClick={() => navigate("/dashboard/incidents")}  variant='outline' size='icon'className='scale-95 rounded-full cursor-pointer dark:text-white/80 '>
      <Bell className='size-[1.2rem] text-axblue-1 dark:text-white/90' />
           {count > 0 && (
           <span className="absolute -top-2 -right-1 p-1 w-4 h-4 bg-red-100 rounded-full text-red-600 flex items-center justify-center text-xs">
          {count > 99 ? "99+" : count}
        </span>
      )}
        </Button>
   
  );
}
