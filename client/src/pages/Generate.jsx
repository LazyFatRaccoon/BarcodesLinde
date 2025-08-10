// client/src/pages/Generate.jsx
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import axios from "../api/axios";

export function GeneratePage() {
  const [code, setCode] = useState("");
  const svgRef = useRef(null);

  // генерить локально
  useEffect(() => {
    if (code && svgRef.current) {
      JsBarcode(svgRef.current, code, {
        format: "CODE128",
        displayValue: true,
      });
    }
  }, [code]);

  // получить новый уникальный код с бэка (резерв диапазона)
  const getNewCode = async () => {
    const { data } = await axios.post("/barcodes/reserve"); // вернёт {code:"CYL-00000123"}
    setCode(data.code);
  };

  const print = () => window.print();

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Генерація штрихкоду</h1>
      <div className="flex gap-2 my-3">
        <button className="btn-primary" onClick={getNewCode}>
          Згенерувати код
        </button>
        <input
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="або введи код вручну"
        />
        <button className="btn" onClick={print}>
          Друк
        </button>
      </div>

      <div className="print-area border p-4 inline-block">
        <svg ref={svgRef}></svg>
        <div className="text-center mt-2">{code}</div>
      </div>
    </div>
  );
}
