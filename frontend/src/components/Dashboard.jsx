import { useContext, useEffect, useRef } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import Chart from 'chart.js/auto';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserMinus, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  FileText,
  FileSpreadsheet,
  Monitor,
  Briefcase
} from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
  const { employees, records, api, triggerNotification } = useContext(AttendanceContext);

  const trendsCanvasRef = useRef(null);
  const statsCanvasRef = useRef(null);
  const trendsChartInstance = useRef(null);
  const statsChartInstance = useRef(null);

  // Get current date string
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Format date for display
  const formatDateDisplay = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const activeEmployees = employees.filter(emp => emp.status === 'Active');
  
  // Filter records for today
  const todayRecords = records.filter(rec => rec.date === todayStr);

  const totalEmployees = activeEmployees.length;
  const presentToday = todayRecords.filter(rec => rec.status === 'Present').length;
  const absentToday = todayRecords.filter(rec => rec.status === 'Absent').length;
  const leaveToday = todayRecords.filter(rec => rec.status === 'Leave').length;
  const halfDayToday = todayRecords.filter(rec => rec.status === 'Half Day').length;
  const wfhToday = todayRecords.filter(rec => rec.status === 'Work From Home').length;
  
  // Roster attendance status map
  const markedEmployeesMap = new Map(todayRecords.map(rec => [rec.employeeId, rec.status]));
  const unmarkedEmployees = activeEmployees.filter(emp => !markedEmployeesMap.has(emp.id));


  const totalPresent = records.filter(rec => rec.status === 'Present').length;
  const totalAbsent = records.filter(rec => rec.status === 'Absent').length;
  const totalLeave = records.filter(rec => rec.status === 'Leave').length;
  const totalHalfDay = records.filter(rec => rec.status === 'Half Day').length;
  const totalWFH = records.filter(rec => rec.status === 'Work From Home').length;



  // CSV and PDF Report Download Logic
  const handleExport = async (type) => {
    try {
      triggerNotification('warning', `Generating ${type.toUpperCase()} report...`);
      const res = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
      
      const blob = new Blob([res.data], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `attendance_report_${todayStr}.${type}`;
      link.click();
      
      triggerNotification('success', `${type.toUpperCase()} report downloaded successfully.`);
    } catch (err) {
      console.error(err);
      triggerNotification('error', `Failed to export ${type.toUpperCase()} report.`);
    }
  };

  // Render Chart.js Analytics
  useEffect(() => {
    // 1. Attendance Trends Line Chart (Past 7 dates that have records)
    if (trendsCanvasRef.current && records.length > 0) {
      // Get unique dates
      const uniqueDates = [...new Set(records.map(r => r.date))].sort();
      // Get last 7 dates
      const recentDates = uniqueDates.slice(-7);
      
      // Calculate presence rates for those dates
      const presenceRates = recentDates.map(date => {
        const dayRecords = records.filter(r => r.date === date);
        const presentCount = dayRecords.filter(r => r.status === 'Present').length;
        const wfhCount = dayRecords.filter(r => r.status === 'Work From Home').length;
        const halfDayCount = dayRecords.filter(r => r.status === 'Half Day').length;
        
        const score = presentCount + wfhCount + (halfDayCount * 0.5);
        return dayRecords.length > 0 ? Math.round((score / dayRecords.length) * 100) : 0;
      });

      // Destroy previous chart instance if exists
      if (trendsChartInstance.current) {
        trendsChartInstance.current.destroy();
      }

      const ctx = trendsCanvasRef.current.getContext('2d');
      trendsChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: recentDates.map(d => {
            const dateObj = new Date(d);
            return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          datasets: [{
            label: 'Attendance Rate (%)',
            data: presenceRates,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#4f46e5',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: 'var(--border-color)' },
              ticks: { color: 'var(--text-muted)', callback: value => `${value}%` }
            },
            x: {
              grid: { display: false },
              ticks: { color: 'var(--text-muted)' }
            }
          }
        }
      });
    }

    // 2. Attendance Status Distribution Doughnut Chart
    if (statsCanvasRef.current) {
      if (statsChartInstance.current) {
        statsChartInstance.current.destroy();
      }

      const ctx = statsCanvasRef.current.getContext('2d');
      statsChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent', 'Leave', 'Half Day', 'WFH'],
          datasets: [{
            data: [totalPresent, totalAbsent, totalLeave, totalHalfDay, totalWFH],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'],
            borderWidth: 2,
            borderColor: 'var(--surface)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'var(--text-secondary)',
                boxWidth: 10,
                font: { size: 10, weight: 'bold' }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    return () => {
      if (trendsChartInstance.current) trendsChartInstance.current.destroy();
      if (statsChartInstance.current) statsChartInstance.current.destroy();
    };
  }, [records, totalPresent, totalAbsent, totalLeave, totalHalfDay, totalWFH]);

  return (
    <div className="dashboard-layout">
      {/* Date Header & Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            System Dashboard Overview
          </h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Calendar size={16} className="text-muted" />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formatDateDisplay(todayStr)}</span>
          </p>
        </div>
        
        {/* Admin Reports Export Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
            onClick={() => handleExport('csv')}
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
            onClick={() => handleExport('pdf')}
          >
            <FileText size={16} />
            <span>Export PDF</span>
          </button>
          {unmarkedEmployees.length > 0 && (
            <button 
              className="btn btn-primary" 
              style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
              onClick={() => setActiveTab('mark')}
            >
              <Plus size={18} />
              <span>Mark Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Roster Card */}
        <div className="card stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Roster</span>
            <span className="stat-value">{totalEmployees}</span>
          </div>
          <div className="stat-icon-wrapper primary">
            <Users size={24} />
          </div>
        </div>

        {/* Present Stats */}
        <div className="card stat-card">
          <div className="stat-info">
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{presentToday}</span>
          </div>
          <div className="stat-icon-wrapper success">
            <UserCheck size={24} />
          </div>
        </div>

        {/* Absent Stats */}
        <div className="card stat-card">
          <div className="stat-info">
            <span className="stat-label">Absent Today</span>
            <span className="stat-value">{absentToday}</span>
          </div>
          <div className="stat-icon-wrapper danger">
            <UserX size={24} />
          </div>
        </div>

        {/* Leave Stats */}
        <div className="card stat-card">
          <div className="stat-info">
            <span className="stat-label">On Leave Today</span>
            <span className="stat-value">{leaveToday}</span>
          </div>
          <div className="stat-icon-wrapper warning">
            <UserMinus size={24} />
          </div>
        </div>

        {/* Half Day Stats */}
        <div className="card stat-card">
          <div className="stat-info">
            <span className="stat-label">Half Day Today</span>
            <span className="stat-value">{halfDayToday}</span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Briefcase size={24} />
          </div>
        </div>

        {/* WFH Stats */}
        <div className="card stat-card">
          <div className="stat-info">
            <span className="stat-label">WFH Today</span>
            <span className="stat-value">{wfhToday}</span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Monitor size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Charts & Details Section */}
      <div className="dashboard-sections" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        alignItems: 'stretch'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Chart JS Panel */}
          {records.length > 0 ? (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                <span>Attendance Analytical Trends</span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }} className="summary-container">
                {/* Trends Line Graph */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Daily Presence Rate (Past 7 Active Days)
                  </h4>
                  <div style={{ height: '220px', position: 'relative' }}>
                    <canvas ref={trendsCanvasRef}></canvas>
                  </div>
                </div>

                {/* Doughnut Distribution */}
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textAlign: 'center' }}>
                    Total System Distribution
                  </h4>
                  <div style={{ height: '220px', position: 'relative' }}>
                    <canvas ref={statsCanvasRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card empty-state" style={{ padding: '3rem' }}>
              <AlertCircle size={40} className="empty-state-icon" />
              <h4 className="empty-state-title">No System Logs</h4>
              <p>Database attendance table is currently empty. Record some entries to display analytical charts.</p>
            </div>
          )}

          {/* Today's Roster List */}
          <div className="card">
            <h3 className="card-title">
              Today's Attendance Status Registry
            </h3>
            
            {todayRecords.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No records marked for today yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todayRecords.map((rec) => {
                  const emp = activeEmployees.find(e => e.id === rec.employeeId);
                  if (!emp) return null;
                  return (
                    <div key={rec.id} className="roster-item" style={{ padding: '0.65rem 1rem' }}>
                      <div className="roster-item-info">
                        <div className="roster-avatar">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{emp.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({emp.employeeId || 'N/A'})</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.department} • {emp.designation}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {rec.time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.time}</span>}
                        <span className={`badge ${rec.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
