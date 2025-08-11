// client/src/pages/Scan.jsx
import { useState, useRef } from "react";
import axios from "../api/axios";
import { BrowserMultiFormatReader } from "@zxing/browser";

export function ScanPage() {
  const [code, setCode] = useState("");
  const [asset, setAsset] = useState(null); // найденный
  const [form, setForm] = useState(null); // данные для создания/редактирования
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const startScan = async () => {
    readerRef.current = new BrowserMultiFormatReader();

    await readerRef.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (res) => {
        if (res) {
          handleCode(res.getText());
          stopScan();
        }
      }
    );
  };
  const stopScan = () => readerRef.current?.reset();

  const handleCode = async (c) => {
    setCode(c);
    try {
      const { data } = await axios.get(
        `/assets/by-barcode/${encodeURIComponent(c)}`
      );
      setAsset(data); // есть в БД
      setForm(data); // редактирование
    } catch (e) {
      if (e.response?.status === 404) {
        // нет в БД — создаём черновик
        setAsset(null);
        setForm({
          barcode: c,
          type: "cylinder", // по умолчанию
          is_filled: false,
          location: "",
          owner: "",
          product_code: "",
          cylinder_no: "",
          cylinder_kind: "",
          tare_weight: null,
          test_pressure: null,
          work_pressure: null,
          test_date: "",
          next_test_date: "",
        });
      } else {
        alert("Помилка пошуку");
      }
    }
  };

  const save = async () => {
    try {
      const id = asset?._id || form?.id; // <-- беремо _id
      console.log("id", id);
      const payload = { ...form };

      // якщо поля дат можуть бути пустими — нормалізуємо
      if (!payload.test_date) payload.test_date = null;
      if (!payload.next_test_date) payload.next_test_date = null;

      const { data } = id
        ? await axios.put(`/assets/${id}`, payload) // оновлення
        : await axios.post(`/assets`, payload); // створення

      setAsset(data);
      setForm(data);
      alert(id ? "Збережено" : "Додано");
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      alert("Помилка збереження: " + msg);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Сканування штрихкоду</h1>

      <div className="flex gap-2">
        <button className="btn" onClick={startScan}>
          Сканувати камерою
        </button>
        <input
          className="input text-black"
          placeholder="Або введіть код вручну"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCode(code)}
        />
      </div>

      <video
        ref={videoRef}
        className="w-full max-w-md rounded"
        autoPlay
        playsInline
      />

      {form && (
        <div className="space-y-2 border p-3 rounded">
          <div className="font-medium">
            {asset ? "Редагування" : "Новий запис"}
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <label>
              Штрихкод
              <input
                className="input text-black"
                value={form.barcode}
                readOnly
              />
            </label>
            <label>
              Тип актива
              <select
                className="input text-black"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="cylinder">Балон</option>
                <option value="pallet">Палета</option>
                <option value="bundle">Бандл</option>
                <option value="dewar">Дюар</option>
              </select>
            </label>

            {/* поля для балона */}
            {form.type === "cylinder" && (
              <>
                <label>
                  Номер балона
                  <input
                    className="input text-black"
                    value={form.cylinder_no || ""}
                    onChange={(e) =>
                      setForm({ ...form, cylinder_no: e.target.value })
                    }
                  />
                </label>
                <label>
                  Тип балона
                  <input
                    className="input text-black"
                    value={form.cylinder_kind || ""}
                    onChange={(e) =>
                      setForm({ ...form, cylinder_kind: e.target.value })
                    }
                  />
                </label>
                <label>
                  Заповнений?
                  <select
                    className="input text-black"
                    value={form.is_filled}
                    onChange={(e) =>
                      setForm({ ...form, is_filled: e.target.value === "true" })
                    }
                  >
                    <option value="false">Ні</option>
                    <option value="true">Так</option>
                  </select>
                </label>
                {form.is_filled && (
                  <label>
                    Код продукції
                    <input
                      className="input text-black"
                      value={form.product_code || ""}
                      onChange={(e) =>
                        setForm({ ...form, product_code: e.target.value })
                      }
                    />
                  </label>
                )}
                <label>
                  Дата освідчення
                  <input
                    type="date"
                    className="input text-black"
                    value={formatDate(form.test_date) || ""}
                    onChange={(e) =>
                      setForm({ ...form, test_date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Наступне освідчення
                  <input
                    type="date"
                    className="input text-black"
                    value={formatDate(form.next_test_date) || ""}
                    onChange={(e) =>
                      setForm({ ...form, next_test_date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Вага порожнього
                  <input
                    className="input text-black"
                    type="number"
                    step="0.01"
                    value={form.tare_weight || ""}
                    onChange={(e) =>
                      setForm({ ...form, tare_weight: +e.target.value || null })
                    }
                  />
                </label>
                <label>
                  Тестовий тиск
                  <input
                    className="input text-black"
                    type="number"
                    step="0.1"
                    value={form.test_pressure || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        test_pressure: +e.target.value || null,
                      })
                    }
                  />
                </label>
                <label>
                  Робочий тиск
                  <input
                    className="input text-black"
                    type="number"
                    step="0.1"
                    value={form.work_pressure || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        work_pressure: +e.target.value || null,
                      })
                    }
                  />
                </label>
              </>
            )}

            <label>
              Локація
              <input
                className="input text-black"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>
            <label>
              Власник
              <input
                className="input text-black"
                value={form.owner || ""}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" onClick={save}>
              {asset ? "Зберегти" : "Додати"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
