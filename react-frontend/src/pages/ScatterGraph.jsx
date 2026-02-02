import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function ScatterGraph({ data }) {
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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
        <CartesianGrid />
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
