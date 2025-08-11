// client/src/pages/Assets.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

const TYPES = ["cylinder", "pallet", "bundle", "dewar"];

export default function AssetsPage() {
  const [type, setType] = useState("cylinder");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);

  const load = async () => {
    const { data } = await axios.get("/assets", {
      params: { type, q, page, limit: 20 },
    });
    setRows(data.items);
    setTotal(data.total);
  };

  useEffect(() => {
    setPage(1);
  }, [type, q]);
  useEffect(() => {
    load();
  }, [type, q, page]);

  const openRow = async (row) => {
    setSelected(row);
    const { data } = await axios.get(`/assets/${row.id || row._id}/events`);
    setEvents(data);
  };

  return (
    <div className="p-1 grid grid-cols-1 md:grid-cols-3 gap-2">
      <div className="md:col-span-2">
        <div className="flex gap-2 mb-3">
          <select
            className="input text-black"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="input text-black flex-1"
            placeholder="Пошук (barcode / номер / локація / власник)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <table className="w-full text-sm border">
          <thead className="bg-zinc-100 text-black">
            <tr>
              <th className="p-1 text-left">Barcode</th>
              <th className="p-1 text-left">Тип</th>
              <th className="p-1 text-left">Номер</th>
              <th className="p-1 text-left">Продукт</th>
              <th className="p-1 text-left">Склад</th>
              <th className="p-1 text-left">Оновлено</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id || r._id}
                className="border-b hover:bg-zinc-50 cursor-pointer"
                onClick={() => openRow(r)}
              >
                <td className="p-1">{r.barcode}</td>
                <td className="p-1">{r.type}</td>
                <td className="p-1">{r.cylinder_no || "-"}</td>
                <td className="p-1">{r.product_code || "-"}</td>
                <td className="p-1">{r.location || "-"}</td>
                <td className="p-1">
                  {new Date(r.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-center" colSpan={6}>
                  Нічого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-3 flex items-center gap-2">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Назад
          </button>
          <span>
            Сторінка {page} із {Math.max(1, Math.ceil(total / 20))}
          </span>
          <button
            className="btn"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперед
          </button>
        </div>
      </div>

      <div className="md:col-span-1 border rounded p-3">
        <div className="font-semibold mb-2 ">Події</div>
        {selected ? (
          <div>
            <div className="text-sm mb-2">
              Asset: <b>{selected.barcode}</b>
            </div>
            <ul className="space-y-2 max-h-[60vh] overflow-auto">
              {events.map((ev) => (
                <li key={ev._id} className="border p-2 rounded">
                  <div className="text-xs opacity-70">
                    {new Date(ev.createdAt).toLocaleString()} • {ev.type}
                  </div>
                  {ev.location && <div>Локація: {ev.location}</div>}
                  {ev.user_id && <div>User: {ev.user_id}</div>}
                  {ev.payload && (
                    <pre className="text-xs text-black overflow-auto bg-zinc-100 p-2 rounded">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
              {!events.length && <div className="text-sm">Подій немає</div>}
            </ul>
          </div>
        ) : (
          <div className="text-sm opacity-80">
            Виберіть актив у таблиці, щоб побачити історію
          </div>
        )}
      </div>
    </div>
  );
}
