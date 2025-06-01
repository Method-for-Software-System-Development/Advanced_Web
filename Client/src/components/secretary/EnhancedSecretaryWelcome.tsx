import React, { useState, useEffect } from 'react';
import statisticsService, { DashboardStatistics } from '../../services/statisticsService';

interface EnhancedSecretaryWelcomeProps {
  onNavigateToAppointments: () => void;
  onNavigateToManagePatients: () => void;
  onNavigateToEditStaff: () => void;
}

const EnhancedSecretaryWelcome: React.FC<EnhancedSecretaryWelcomeProps> = ({ 
  onNavigateToAppointments, 
  onNavigateToManagePatients,
  onNavigateToEditStaff 
}) => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await statisticsService.getDashboardStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-700 bg-green-200';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no_show': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <button 
          onClick={loadStatistics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#4A3F35] mb-3">Secretary Dashboard</h1>
        <p className="text-lg text-gray-600">Comprehensive clinic management overview</p>
      </header>

      {/* Quick Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Total Patients</h3>
            <p className="text-3xl font-bold">{statistics.overview.totalPatients}</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Active Staff</h3>
            <p className="text-3xl font-bold">{statistics.overview.totalStaff}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Today's Appointments</h3>
            <p className="text-3xl font-bold">{statistics.overview.todayAppointments}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Weekly Revenue</h3>
            <p className="text-2xl font-bold">{formatCurrency(statistics.overview.weeklyRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-red-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Monthly Revenue</h3>
            <p className="text-2xl font-bold">{formatCurrency(statistics.overview.monthlyRevenue)}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Navigation Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-[#4A3F35] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Appointments Card */}
            <button
              onClick={onNavigateToAppointments}
              className="block p-6 bg-gradient-to-br from-[#EF92A6] to-[#E87A90] text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#F9F3F0] focus:ring-opacity-50"
            >
              <h3 className="text-xl font-semibold mb-2">&#128197; View Appointments</h3>
              <p className="text-sm opacity-90">Access calendar, view schedules, and export reports</p>              {statistics && (
                <div className="mt-3 text-sm">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-gray-800">
                    {statistics.todayStats.total} today
                  </span>
                </div>
              )}
            </button>

            {/* Manage Patients Card */}
            <button
              onClick={onNavigateToManagePatients}
              className="block p-6 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-200 focus:ring-opacity-50"
            >
              <h3 className="text-xl font-semibold mb-2">&#128062; Manage Patients</h3>
              <p className="text-sm opacity-90">Update patient records and contact information</p>
              {statistics && (                <div className="mt-3 text-sm">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-gray-800">
                    {statistics.overview.totalPatients} total
                  </span>
                </div>
              )}
            </button>

            {/* Manage Staff Card */}
            <button
              onClick={onNavigateToEditStaff}
              className="block p-6 bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50"
            >
              <h3 className="text-xl font-semibold mb-2">&#128101; Manage Staff</h3>
              <p className="text-sm opacity-90">Update profiles, roles, and availability</p>
              {statistics && (                <div className="mt-3 text-sm">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-gray-800">
                    {statistics.overview.totalStaff} active
                  </span>
                </div>
              )}
            </button>            {/* Settings Card */}
            <div className="block p-6 bg-gray-100 text-gray-700 rounded-lg shadow-lg cursor-not-allowed opacity-60">
              <h3 className="text-xl font-semibold mb-2">&#9881; Settings</h3>
              <p className="text-sm opacity-90">Configure application preferences</p>
              <div className="mt-3 text-sm">
                <span className="bg-gray-300 px-2 py-1 rounded text-xs">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-[#4A3F35] mb-4">&#128203; Today's Schedule</h3>
          {statistics && statistics.todayAppointments.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {statistics.todayAppointments.slice(0, 8).map((apt) => (
                <div key={apt.id} className="border-l-4 border-[#EF92A6] pl-3 py-2 bg-gray-50 rounded-r">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{apt.time}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(apt.status)}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{apt.clientName}</strong> with <strong>{apt.petName}</strong>
                  </p>
                  <p className="text-xs text-gray-600">{apt.service} &bull; {apt.staffName}</p>
                </div>
              ))}
              {statistics.todayAppointments.length > 8 && (
                <p className="text-sm text-gray-500 text-center">
                  +{statistics.todayAppointments.length - 8} more appointments
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
          )}
        </div>
      </div>

      {/* Bottom Stats Grid */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#4A3F35] mb-4">&#128197; Upcoming This Week</h3>
            {statistics.upcomingAppointments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {statistics.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="border-l-4 border-blue-400 pl-3 py-2 bg-blue-50 rounded-r">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">
                        {new Date(apt.date).toLocaleDateString()} {apt.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>{apt.clientName}</strong> - {apt.petName}
                    </p>
                    <p className="text-xs text-gray-600">{apt.service}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            )}
          </div>

          {/* Popular Services */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#4A3F35] mb-4">&#128202; Popular Services</h3>            {statistics.popularServices.length > 0 ? (
              <div className="space-y-3">
                {statistics.popularServices.map((service) => (
                  <div key={service.service} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{service.service}</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-[#EF92A6] h-2 rounded-full" 
                          style={{ 
                            width: `${(service.count / statistics.popularServices[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{service.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No service data available</p>
            )}
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#4A3F35] mb-4">&#128200; This Week's Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Appointments</span>
                <span className="font-semibold">{statistics.weekStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{statistics.weekStats.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-semibold text-red-600">{statistics.weekStats.cancelled}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-bold text-green-700">{formatCurrency(statistics.weekStats.revenue)}</span>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                <div className="text-lg font-bold text-green-600">
                  {statistics.weekStats.total > 0 ? 
                    Math.round((statistics.weekStats.completed / statistics.weekStats.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-8">        <button
          onClick={loadStatistics}
          className="px-6 py-2 bg-[#664147] text-white rounded-lg hover:bg-[#58383E] transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '⟲ Refresh Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedSecretaryWelcome;
