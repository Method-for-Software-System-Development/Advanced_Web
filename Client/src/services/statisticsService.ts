/**
 * Statistics Service - API calls for dashboard analytics and metrics
 */
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export interface DashboardOverview {
  totalPatients: number;
  totalStaff: number;
  todayAppointments: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface WeekStats {
  total: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface MonthStats {
  total: number;
  completed: number;
  revenue: number;
}

export interface TodayAppointment {
  id: string;
  time: string;
  clientName: string;
  petName: string;
  service: string;
  staffName: string;
  status: string;
  duration: number;
  cost?: number;
}

export interface UpcomingAppointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  petName: string;
  service: string;
  staffName: string;
  status: string;
}

export interface PopularService {
  service: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  date: string;
  clientName: string;
  petName: string;
  service: string;
  status: string;
  updatedAt: string;
}

export interface DashboardStatistics {
  overview: DashboardOverview;
  todayStats: AppointmentStats;
  weekStats: WeekStats;
  monthStats: MonthStats;
  todayAppointments: TodayAppointment[];
  upcomingAppointments: UpcomingAppointment[];
  popularServices: PopularService[];
  recentActivity: RecentActivity[];
}

export interface RevenueStatistics {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  averagePerAppointment: number;
  totalAppointments: number;
  revenueByService: Array<{ service: string; revenue: number }>;
}

export const statisticsService = {
  // Get comprehensive dashboard statistics
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics/dashboard`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  },

  // Get revenue statistics
  async getRevenueStatistics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<RevenueStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics/revenue?period=${period}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue statistics:', error);
      throw error;
    }
  }
};

export default statisticsService;
