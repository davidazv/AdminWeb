"use client";

import { useState } from "react";
import apiClient from "@/lib/api-client";

export default function TestApiPage() {
  const [result, setResult] = useState<string>("");

  const testConnection = async () => {
    try {
      console.log("🧪 Probando conexión directa con axios...");
      
      const response = await apiClient.post("/auth/admin/login", {
        email: "admin@test.com",
        password: "test123"
      });
      
      setResult(`✅ Éxito: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error("Error completo:", error);
      setResult(`❌ Error: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
  };

  const testFetch = async () => {
    try {
      console.log("🧪 Probando conexión directa con fetch...");
      
      const response = await fetch("http://localhost:3002/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@test.com", 
          password: "test123"
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResult(`❌ Fetch Error: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`✅ Fetch Éxito: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setResult(`❌ Fetch Error: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API Connection</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Test con Axios
        </button>
        
        <button 
          onClick={testFetch}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test con Fetch
        </button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {result || "Presiona un botón para probar..."}
        </pre>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">URL configurada:</h2>
        <p className="bg-yellow-100 p-2 rounded">
          {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}
        </p>
      </div>
    </div>
  );
}