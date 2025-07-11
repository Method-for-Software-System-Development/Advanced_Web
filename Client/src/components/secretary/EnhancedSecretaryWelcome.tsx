import React, { useState, useEffect } from 'react';
import statisticsService, { DashboardStatistics } from '../../services/statisticsService';
import ChangePasswordModal from './ChangePasswordModal';
import { Lock } from 'lucide-react';

interface EnhancedSecretaryWelcomeProps {
  onNavigateToAppointments: () => void;
  onNavigateToManagePatients: () => void;
  onNavigateToEditStaff: () => void;
  onNavigateToAddPrescription: () => void;
}

const EnhancedSecretaryWelcome: React.FC<EnhancedSecretaryWelcomeProps> = ({
  onNavigateToAppointments,
  onNavigateToManagePatients,
  onNavigateToEditStaff,
  onNavigateToAddPrescription
}) => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

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
          <div className="text-lg text-grayText dark:text-lightGrayText">Loading dashboard...</div>
        </div>
      </div>
    );
  } if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <button
          onClick={loadStatistics}
          className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-40 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer font-bold"
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
        <h1 className="text-4xl font-bold text-wine font-[Nunito] dark:text-white mb-1">Secretary Dashboard</h1>
        <p className="text-lg text-grayText dark:text-lightGrayText">Comprehensive clinic management overview</p>
      </header>

      {/* Quick Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-pinkDark text-grayText p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Total Patients</h3>
            <p className="text-3xl font-bold">{statistics.overview.totalPatients}</p>
          </div>
          <div className="bg-orangeDark text-grayText p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Active Staff</h3>
            <p className="text-3xl font-bold">{statistics.overview.totalStaff}</p>
          </div>
          <div className="bg-skyDark text-grayText p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Today's Appointments</h3>
            <p className="text-3xl font-bold">{statistics.overview.todayAppointments}</p>
          </div>
          <div className="bg-mintDark text-grayText p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Weekly Revenue</h3>
            <p className="text-2xl font-bold">{formatCurrency(statistics.overview.weeklyRevenue)}</p>
          </div>
          <div className="bg-mintDark text-grayText p-6 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium opacity-90">Monthly Revenue</h3>
            <p className="text-2xl font-bold">{formatCurrency(statistics.overview.monthlyRevenue)}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Navigation Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-grayText dark:text-lightGrayText mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Appointments Card */}
            <button
              onClick={onNavigateToAppointments}
              className="block p-6 bg-gradient-to-br from-pink to-pinkDark text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2 text-grayText">&#128197; Manage Appointments</h3>
              <p className="text-sm opacity-90 text-grayText">View schedule, update appointments, add vet notes and export reports</p>              {statistics && (
                <div className="mt-3 text-sm">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-grayText">
                    {statistics.todayStats.total} today
                  </span>
                </div>
              )}
            </button>
            {/* Manage Patients Card */}
            <button
              onClick={onNavigateToManagePatients}
              className="block p-6 bg-gradient-to-br from-sky to-skyDark text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2 text-grayText">&#128062; Manage Patients</h3>
              <p className="text-sm opacity-90 text-grayText">Update patient records and contact information</p>              {statistics && (<div className="mt-3 text-sm">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-grayText">
                  {statistics.overview.totalPatients} total
                </span>
              </div>
              )}
            </button>
            {/* Manage Staff Card */}
            <button
              onClick={onNavigateToEditStaff}
              className="block p-6 bg-gradient-to-br from-mint to-mintDark text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2 text-grayText">&#128101; Manage Staff</h3>
              <p className="text-sm opacity-90 text-grayText">Update profiles, roles, and availability</p>              {statistics && (<div className="mt-3 text-sm">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-grayText">
                  {statistics.overview.totalStaff} active
                </span>
              </div>
              )}
            </button>
            {/* Add Prescription Card */}
            <button
              onClick={onNavigateToAddPrescription}
              className="block p-6 bg-gradient-to-br from-orange to-orangeDark text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2 text-grayText">&#128138; Add Prescription</h3>
              <p className="text-sm opacity-90 text-grayText">Create new prescriptions for patients</p>              <div className="mt-3 text-sm">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-grayText">
                  Manage Medications
                </span>
              </div>
            </button>
          </div>
        </div>
        {/* Today's Appointments Summary */}
        <div className="bg-white dark:bg-darkModeLight rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-grayText dark:text-white mb-4">&#128203; Today's Schedule</h3>
          {statistics && statistics.todayAppointments.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto dashboard-custom-scrollbar">              {statistics.todayAppointments.slice(0, 8).map((apt) => (
              <div key={apt.id} className="border-l-4 border-pinkDark pl-3 py-2 bg-gray-100 dark:bg-darkMode rounded-r">                  <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-grayText dark:text-lightGrayText">{apt.time}</span>
                <span className={`px-2 py-1 text-xs rounded-full mr-2 ${getStatusColor(apt.status)}`}>
                  {apt.status.replace('_', ' ')}
                </span>
              </div>                  <p className="text-sm text-grayText dark:text-lightGrayText">
                  <strong>{apt.clientName}</strong> with <strong>{apt.petName}</strong>
                </p>
                <p className="text-xs text-grayText dark:text-lightGrayText">{apt.service} &bull; {apt.staffName}</p>
              </div>
            ))}              {statistics.todayAppointments.length > 8 && (
              <p className="text-sm text-grayText dark:text-lightGrayText text-center">
                +{statistics.todayAppointments.length - 8} more appointments
              </p>
            )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No appointments scheduled for today</p>
          )}
        </div>
      </div>

      {/* Bottom Stats Grid */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-darkModeLight rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-grayText dark:text-white mb-4">&#128197; Upcoming This Week</h3>
            {statistics.upcomingAppointments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">                {statistics.upcomingAppointments.map((apt) => (
                <div key={apt.id} className="border-l-4 border-skyDark pl-3 py-2 bg-gray-100 dark:bg-darkMode dark:bg-opacity-30 rounded-r">                    <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-grayText dark:text-lightGrayText">
                    {new Date(apt.date).toLocaleDateString()} {apt.time}
                  </span>
                </div>
                  <p className="text-sm text-grayText dark:text-lightGrayText">
                    <strong>{apt.clientName}</strong> - {apt.petName}
                  </p>
                  <p className="text-xs text-grayText dark:text-lightGrayText">{apt.service}</p>
                </div>
              ))}
              </div>
            ) : (
              <p className="text-grayText dark:text-lightGrayText text-center py-8">No upcoming appointments</p>
            )}
          </div>          {/* Popular Services */}
          <div className="bg-white dark:bg-darkModeLight rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-grayText dark:text-white mb-4">&#128202; Popular Services</h3>{statistics.popularServices.length > 0 ? (
              <div className="space-y-3">                {statistics.popularServices.map((service) => (<div key={service.service} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-grayText dark:text-lightGrayText">{service.service}</span>
                  <span className="text-sm font-medium text-grayText dark:text-lightGrayText">{service.count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-darkMode rounded-full h-2">
                  <div
                    className="bg-pinkDark h-2 rounded-full"
                    style={{
                      width: `${(service.count / statistics.popularServices[0].count) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              ))}
              </div>
            ) : (
              <p className="text-grayText dark:text-lightGrayText text-center py-8">No service data available</p>
            )}
          </div>          {/* Weekly Summary */}
          <div className="bg-white dark:bg-darkModeLight rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-grayText dark:text-white mb-4">&#128200; This Week's Summary</h3>            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-grayText dark:text-lightGrayText">Total Appointments</span>
                <span className="font-semibold text-grayText dark:text-lightGrayText">{statistics.weekStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grayText dark:text-lightGrayText">Completed</span>
                <span className="font-semibold text-green-600">{statistics.weekStats.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grayText dark:text-lightGrayText">Cancelled</span>
                <span className="font-semibold text-red-600">{statistics.weekStats.cancelled}</span>
              </div>
              <div className="border-t dark:border-gray-500 pt-3">
                <div className="flex justify-between">
                  <span className="text-grayText dark:text-lightGrayText">Revenue</span>
                  <span className="font-bold text-green-600">{formatCurrency(statistics.weekStats.revenue)}</span>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-darkMode p-3 rounded">
                <div className="text-sm text-grayText dark:text-lightGrayText mb-1">Completion Rate</div>
                <div className="text-lg font-bold text-green-600">
                  {statistics.weekStats.total > 0 ?
                    Math.round((statistics.weekStats.completed / statistics.weekStats.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Refresh Button */}
      <div className="text-center mt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={loadStatistics}
            className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-60 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '⟲ Refresh Dashboard'}
          </button>          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="bg-pinkDark text-white w-60 h-11 rounded-full hover:bg-pinkDarkHover transform transition duration-200 hover:scale-110 cursor-pointer font-bold flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          // Optional: You can add a success notification here
          console.log('Password changed successfully');
        }}
      />
    </div>
  );
};

export default EnhancedSecretaryWelcome;