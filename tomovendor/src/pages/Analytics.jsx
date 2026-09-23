import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function Analytics() {
  const [data, setData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    chart: { labels: [], data: [] },
    topItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('vendorToken');
        const res = await axios.get(`${API_URL}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const lineChartData = {
    labels: data.chart.labels.length > 0 ? data.chart.labels : ['No Data'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data.chart.data.length > 0 ? data.chart.data : [0],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.3,
        fill: true
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading Analytics...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Analytics Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--sw-text-light)', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>₹{data.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--sw-text-light)', marginBottom: '8px' }}>Total Delivered Orders</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data.totalOrders}</div>
        </div>
        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--sw-text-light)', marginBottom: '8px' }}>Average Order Value</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>₹{data.averageOrderValue}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Revenue Trend</h3>
          <div style={{ height: '300px' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Top Selling Items</h3>
          {data.topItems.length === 0 ? (
            <p style={{ color: 'var(--sw-text-light)' }}>No sales data yet.</p>
          ) : (
            data.topItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--sw-border)' }}>
                <span style={{ fontWeight: '500' }}>{item.name}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--sw-green)' }}>{item.count} sold</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
