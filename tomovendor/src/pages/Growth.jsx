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
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function Growth() {
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

  const hasData = data.chart.labels.length > 0;

  const barChartData = {
    labels: hasData ? data.chart.labels.map(l => new Date(l).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })) : ['No Data'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: hasData ? data.chart.data : [0],
        backgroundColor: 'rgba(252, 128, 25, 0.8)', // Swiggy Orange with opacity
        borderColor: 'rgba(252, 128, 25, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1b1e2a',
        padding: 12,
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, family: "'Inter', sans-serif", weight: 'bold' },
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f4f5f8' },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        border: { display: false }
      }
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--sw-text-light)' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--sw-orange)' }}></i>
      <div>Loading Growth metrics...</div>
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: 'var(--sw-text-dark)' }}>Business Growth</h1>
          <p style={{ margin: 0, color: 'var(--sw-text-light)', fontSize: '14px' }}>Track your restaurant's performance and analytics</p>
        </div>
        <div style={{ background: '#fce4ec', color: '#c2185b', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
          <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
          Live Analytics
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="sw-setting-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(252, 128, 25, 0.1)', color: 'var(--sw-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-wallet"></i>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Total Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--sw-text-dark)' }}>₹{data.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="sw-setting-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(96, 178, 70, 0.1)', color: 'var(--sw-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-receipt"></i>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Total Orders</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--sw-text-dark)' }}>{data.totalOrders}</div>
          </div>
        </div>

        <div className="sw-setting-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(63, 81, 181, 0.1)', color: '#3f51b5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-chart-pie"></i>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Average Order Value</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--sw-text-dark)' }}>₹{data.averageOrderValue}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Daily Revenue Distribution</h3>
            <select style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--sw-border)', fontSize: '13px' }}>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div style={{ height: '320px' }}>
            {!hasData ? (
              <div className="sw-empty-state" style={{ minHeight: '100%', border: '2px dashed var(--sw-border)', borderRadius: '8px' }}>
                <i className="fas fa-chart-bar" style={{ fontSize: '48px', color: 'var(--sw-text-light)', marginBottom: '16px' }}></i>
                <h3>No Analytics Data</h3>
                <p>Start receiving orders to see your revenue trends here.</p>
              </div>
            ) : (
              <Bar data={barChartData} options={barChartOptions} />
            )}
          </div>
        </div>

        <div className="sw-setting-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px' }}>Top Selling Items</h3>
          
          {(!data.topItems || data.topItems.length === 0) ? (
            <div className="sw-empty-state" style={{ minHeight: '280px', border: '2px dashed var(--sw-border)', borderRadius: '8px' }}>
              <i className="fas fa-utensils" style={{ fontSize: '32px', color: 'var(--sw-text-light)', marginBottom: '16px' }}></i>
              <h3 style={{ fontSize: '14px' }}>No Sales Yet</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.topItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: index === 0 ? '#ffc107' : index === 1 ? '#e0e0e0' : index === 2 ? '#cd7f32' : '#e9ecef',
                    color: index < 3 ? 'white' : 'var(--sw-text-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--sw-text-dark)' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>{item.count} orders</div>
                  </div>
                  <div style={{ color: 'var(--sw-green)', fontWeight: 'bold', fontSize: '14px' }}>
                    <i className="fas fa-arrow-up" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Growth;
