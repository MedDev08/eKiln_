import React, { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceArea 
} from "recharts";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";

export default function ScatterGraph({ data, selectedFour }) {
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const token = localStorage.getItem("token");

  const chartData = data.map(d => ({
    x: d.x,        
    Gauche: d.yGauche,
    Droit: d.yDroit
  }));
 const minValue = Math.min(
  ...chartData.map(d => d.Gauche),
  ...chartData.map(d => d.Droit)
  );
  const maxValue = Math.max(
    ...chartData.map(d => d.Gauche),
    ...chartData.map(d => d.Droit)
  );
  useEffect(() => {
    const fetchZones = async () => {
      if (!selectedFour) return;

      setLoadingZones(true); 
      try {
        const res = await axios.get(
          `http://localhost:8000/api/propriete-graphe/four/${selectedFour}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const zonesWithBounds = res.data.map(zone => ({
          y1: Math.max(zone.V1, minValue),
          y2: Math.min(zone.V2, maxValue),
          color: zone.color
        }));

        setZones(zonesWithBounds);
      } catch (err) {
        console.error("Erreur récupération zones :", err);
        setZones([]);
      } finally {
        setLoadingZones(false); 
      }
    };

    fetchZones();
  }, [selectedFour, token, minValue, maxValue]);

  if (loadingZones) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
        <CartesianGrid />
        {zones.map((zone, index) => (
          <ReferenceArea
            key={index}
            y1={zone.y1}
            y2={zone.y2}
            fill={zone.color}
            // fillOpacity={0.15}
          />
        ))}
        <XAxis
          dataKey="x"
          type="category"
          allowDuplicatedCategory={false}
          tick={{ angle: -45, textAnchor: "end", fontSize: 12 }}
          label={{ value: "Date de sortie", position: "bottom", dy: 40 }}
          interval={0}
        />
        <YAxis
          domain={[minValue,maxValue]}
          label={{ value: "Valeur", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend 
          layout="horizontal"
          verticalAlign="top"
          align="center"
          wrapperStyle={{ paddingBottom: 10 }}
        />
        <Scatter name="Gauche" data={chartData} fill="#8884d8" dataKey="Gauche" />
        <Scatter name="Droit" data={chartData} fill="#82ca9d" dataKey="Droit" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
