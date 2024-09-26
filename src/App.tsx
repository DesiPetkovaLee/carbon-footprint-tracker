import React, { useState, useEffect } from "react";
import "./App.css";

const App: React.FC = () => {
  const [driving, setDriving] = useState<number>(0);
  const [publicTransport, setPublicTransport] = useState<number>(0);
  const [electricity, setElectricity] = useState<number>(0);
  const [meatConsumption, setMeatConsumption] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const [drivingEmissionFactor, setDrivingEmissionFactor] =
    useState<number>(0.404); // kg CO2 per mile
  const [electricityEmissionFactor, setElectricityEmissionFactor] =
    useState<number>(0.475); // kg CO2 per kWh

  // Fetch emission factors on component mount
  useEffect(() => {
    const fetchEmissionFactors = async () => {
      const API_KEY = import.meta.env.CARBON_API_KEY;

      try {
        // Fetch driving emission factor (assuming gasoline car)
        const drivingResponse = await fetch(
          "https://www.carboninterface.com/api/v1/estimates",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "vehicle",
              distance_unit: "mi",
              distance_value: 1,
              vehicle_model_id: "gasoline",
            }),
          }
        );

        const drivingData = await drivingResponse.json();
        if (drivingData.data) {
          setDrivingEmissionFactor(drivingData.data.attributes.carbon_kg);
        }

        // Fetch electricity emission factor (assuming UK grid)
        const electricityResponse = await fetch(
          "https://www.carboninterface.com/api/v1/estimates",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "electricity",
              electricity_unit: "kwh",
              country: "GB",
            }),
          }
        );

        const electricityData = await electricityResponse.json();
        if (electricityData.data) {
          setElectricityEmissionFactor(
            electricityData.data.attributes.carbon_kg
          );
        }
      } catch (error) {
        console.error("Error fetching emission data:", error);
      }
    };

    fetchEmissionFactors();
  }, []);

  const calculateFootprint = (e: React.FormEvent) => {
    e.preventDefault();
    const totalFootprint =
      driving * drivingEmissionFactor +
      publicTransport * 0.089 + // Hardcoded value for public transport
      electricity * electricityEmissionFactor +
      meatConsumption * 2.5; // Approximation for meat consumption

    setResult(totalFootprint);
  };

  return (
    <div>
      {/* App container */}
      <div className="container">
        <h1>Carbon Footprint Tracker</h1>
        <form onSubmit={calculateFootprint}>
          {/* Driving input */}
          <div className="input-group">
            <label htmlFor="driving">Driving (miles/day):</label>
            <input
              type="number"
              id="driving"
              value={driving}
              onChange={(e) => setDriving(Number(e.target.value))}
              min="0"
              placeholder="e.g., 20"
            />
          </div>

          {/* Public Transport input */}
          <div className="input-group">
            <label htmlFor="publicTransport">
              Public Transport (miles/day):
            </label>
            <input
              type="number"
              id="publicTransport"
              value={publicTransport}
              onChange={(e) => setPublicTransport(Number(e.target.value))}
              min="0"
              placeholder="e.g., 5"
            />
          </div>

          {/* Electricity input */}
          <div className="input-group">
            <label htmlFor="electricity">Electricity (kWh/day):</label>
            <input
              type="number"
              id="electricity"
              value={electricity}
              onChange={(e) => setElectricity(Number(e.target.value))}
              min="0"
              placeholder="e.g., 30"
            />
          </div>

          {/* Meat Consumption input */}
          <div className="input-group">
            <label htmlFor="meatConsumption">
              Meat Consumption (servings/day):
            </label>
            <input
              type="number"
              id="meatConsumption"
              value={meatConsumption}
              onChange={(e) => setMeatConsumption(Number(e.target.value))}
              min="0"
              placeholder="e.g., 2"
            />
          </div>

          <button type="submit">Calculate Footprint</button>
        </form>

        {result !== null && (
          <div id="result">
            Your estimated daily carbon footprint is{" "}
            <strong>{result.toFixed(2)} kg CO2</strong>.
          </div>
        )}
      </div>

      {/* Droplets */}
      <div className="droplet"></div>
      <div className="droplet"></div>
      <div className="droplet"></div>
      <div className="droplet"></div>
      <div className="droplet"></div>
      <div className="droplet"></div>
      <div className="droplet"></div>
    </div>
  );
};

export default App;
