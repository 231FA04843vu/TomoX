import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import StatCard from '../components/ui/StatCard';
import { Toast, useToast } from '../components/Toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const API = import.meta.env.VITE_API;

function Analytics() {
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorId = vendor?._id || vendor?.id;
  const { toasts, showToast, removeToast } = useToast();

  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/analytics/sales/${vendorId}`);
        setChartData(res.data || { labels: [], data: [] });
      } catch (error) {
        console.error('Analytics fetch error:', error);
        showToast('Unable to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) fetchData();
  }, [vendorId]);

  const metrics = useMemo(() => {
    const values = chartData.data || [];
    const totalRevenue = values.reduce((sum, value) => sum + Number(value || 0), 0);
    const orders = values.length * 8;
    const avg = orders ? Math.round(totalRevenue / orders) : 0;
    const trend = values.length > 1 ? (((values[values.length - 1] - values[0]) / Math.max(values[0], 1)) * 100).toFixed(1) : 0;

    return {
      totalRevenue,
      orders,
      avg,
      trend,
    };
  }, [chartData]);

  const chartCommon = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: '#c9d4ff' } } },
    scales: {
      x: { ticks: { color: '#91a0d2' }, grid: { color: 'rgba(148,163,184,0.15)' } },
      y: { ticks: { color: '#91a0d2' }, grid: { color: 'rgba(148,163,184,0.15)' } },
    },
  };

  const lineData = {
    labels: chartData.labels,
    datasets: [{
      label: 'Sales',
      data: chartData.data,
      borderColor: '#fc8019',
      backgroundColor: 'rgba(252, 128, 25, 0.2)',
      fill: true,
      tension: 0.35,
      borderWidth: 2,
    }],
  };

  const barData = {
    labels: chartData.labels,
    datasets: [{
      label: 'Revenue Split',
      data: chartData.data,
      backgroundColor: 'rgba(255, 111, 0, 0.6)',
      borderRadius: 6,
    }],
  };

  return (
    <div className="vx-stack">
      <Toast toasts={toasts} removeToast={removeToast} />

      {loading ? (
        <>
          <div className="vx-grid vx-grid-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="vx-card vx-skeleton" style={{ height: '120px' }}></div>
            ))}
          </div>
          <div className="vx-grid vx-grid-2">
            {[1, 2].map((i) => (
              <div key={i} className="vx-card vx-skeleton" style={{ height: '400px' }}></div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="vx-grid vx-grid-4 vx-fade-in">
            <StatCard icon="fa-indian-rupee-sign" label="Revenue" value={`₹${metrics.totalRevenue.toLocaleString()}`} delta={metrics.trend} tone="accent" />
            <StatCard icon="fa-receipt" label="Orders" value={metrics.orders} delta={5} />
            <StatCard icon="fa-scale-balanced" label="Avg Order Value" value={`₹${metrics.avg}`} delta={3} />
            <StatCard icon="fa-wave-square" label="Trend" value={`${metrics.trend}%`} delta={metrics.trend} />
          </div>

          <div className="vx-grid vx-grid-2 vx-fade-in" style={{ animationDelay: '0.1s' }}>
            <section className="vx-card">
              <div className="vx-card-head">
                <div>
                  <h3>Sales Trend Curve</h3>
                  <p>Revenue movement over selected periods.</p>
                </div>
              </div>
              <div style={{ height: '320px' }}>
                <Line data={lineData} options={chartCommon} />
              </div>
            </section>

            <section className="vx-card">
              <div className="vx-card-head">
                <div>
                  <h3>Revenue Distribution</h3>
                  <p>Period-wise contribution analysis.</p>
                </div>
              </div>
              <div style={{ height: '320px' }}>
                <Bar data={barData} options={chartCommon} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
