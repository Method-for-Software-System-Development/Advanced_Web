/**
 * Statistics routes for dashboard analytics and metrics
 */

import { Router, Request, Response } from "express";
import Appointment, { AppointmentStatus, AppointmentType } from "../models/appointmentSchema";
import User from "../models/userSchema";
import Staff from "../models/staffSchema";
import mongoose from "mongoose";

const statisticsRouter = Router();

/**
 * GET /api/statistics/dashboard
 * Get comprehensive dashboard statistics
 */
statisticsRouter.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('userId', 'firstName lastName')
      .populate('petId', 'name')
      .populate('staffId', 'firstName lastName')
      .sort({ time: 1 });

    // Get upcoming appointments (next 7 days excluding today)
    const upcomingAppointments = await Appointment.find({
      date: { $gte: tomorrow, $lt: thisWeekEnd },
      status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] }
    }).populate('userId', 'firstName lastName')
      .populate('petId', 'name')
      .populate('staffId', 'firstName lastName')
      .sort({ date: 1, time: 1 })
      .limit(10);

    // Count statistics - only count users with role "user" or no role as patients
    const totalPatients = await User.countDocuments({
      $or: [
        { role: "user" },
        { role: { $exists: false } },
        { role: null }
      ]
    });
    const totalStaff = await Staff.countDocuments({ isActive: true });
    
    // Today's appointment stats
    const todayStats = {
      total: todayAppointments.length,
      scheduled: todayAppointments.filter(apt => apt.status === AppointmentStatus.SCHEDULED).length,
      confirmed: todayAppointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED).length,
      inProgress: todayAppointments.filter(apt => apt.status === AppointmentStatus.IN_PROGRESS).length,
      completed: todayAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length,
      cancelled: todayAppointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length,
      noShow: todayAppointments.filter(apt => apt.status === AppointmentStatus.NO_SHOW).length
    };

    // This week's stats
    const thisWeekAppointments = await Appointment.find({
      date: { $gte: thisWeekStart, $lt: thisWeekEnd }
    });

    const weekStats = {
      total: thisWeekAppointments.length,
      completed: thisWeekAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length,
      cancelled: thisWeekAppointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length,
      revenue: thisWeekAppointments
        .filter(apt => apt.status === AppointmentStatus.COMPLETED)
        .reduce((sum, apt) => sum + (apt.cost || 0), 0)
    };

    // This month's stats
    const thisMonthAppointments = await Appointment.find({
      date: { $gte: thisMonthStart, $lt: nextMonthStart }
    });

    const monthStats = {
      total: thisMonthAppointments.length,
      completed: thisMonthAppointments.filter(apt => apt.status === AppointmentStatus.COMPLETED).length,
      revenue: thisMonthAppointments
        .filter(apt => apt.status === AppointmentStatus.COMPLETED)
        .reduce((sum, apt) => sum + (apt.cost || 0), 0)
    };

    // Most popular services this month
    const serviceStats = thisMonthAppointments.reduce((acc, apt) => {
      const service = apt.type;
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularServices = Object.entries(serviceStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([service, count]) => ({
        service: service.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        count
      }));

    // Recent activity (last 7 days)
    const recentActivity = await Appointment.find({
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      status: { $in: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] }
    }).populate('userId', 'firstName lastName')
      .populate('petId', 'name')
      .populate('staffId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      overview: {
        totalPatients,
        totalStaff,
        todayAppointments: todayStats.total,
        weeklyRevenue: weekStats.revenue,
        monthlyRevenue: monthStats.revenue
      },
      todayStats,
      weekStats,
      monthStats,
      todayAppointments: todayAppointments.map(apt => ({
        id: apt._id,
        time: apt.time,
        clientName: (apt.userId as any)?.firstName ? 
          `${(apt.userId as any).firstName} ${(apt.userId as any).lastName}` : 'Unknown',
        petName: (apt.petId as any)?.name || 'Unknown',
        service: apt.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        staffName: (apt.staffId as any)?.firstName ? 
          `${(apt.staffId as any).firstName} ${(apt.staffId as any).lastName}` : 'Unknown',
        status: apt.status,
        duration: apt.duration,
        cost: apt.cost
      })),
      upcomingAppointments: upcomingAppointments.map(apt => ({
        id: apt._id,
        date: apt.date,
        time: apt.time,
        clientName: (apt.userId as any)?.firstName ? 
          `${(apt.userId as any).firstName} ${(apt.userId as any).lastName}` : 'Unknown',
        petName: (apt.petId as any)?.name || 'Unknown',
        service: apt.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        staffName: (apt.staffId as any)?.firstName ? 
          `${(apt.staffId as any).firstName} ${(apt.staffId as any).lastName}` : 'Unknown',
        status: apt.status
      })),
      popularServices,
      recentActivity: recentActivity.map(apt => ({
        id: apt._id,
        date: apt.date,
        clientName: (apt.userId as any)?.firstName ? 
          `${(apt.userId as any).firstName} ${(apt.userId as any).lastName}` : 'Unknown',
        petName: (apt.petId as any)?.name || 'Unknown',
        service: apt.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        status: apt.status,
        updatedAt: apt.updatedAt
      }))
    });

  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

/**
 * GET /api/statistics/revenue
 * Get revenue statistics for different time periods
 */
statisticsRouter.get("/revenue", async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate: Date;
    let endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const appointments = await Appointment.find({
      date: { $gte: startDate, $lte: endDate },
      status: AppointmentStatus.COMPLETED
    });

    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.cost || 0), 0);
    const averagePerAppointment = appointments.length > 0 ? totalRevenue / appointments.length : 0;

    // Group by service type
    const revenueByService = appointments.reduce((acc, apt) => {
      const service = apt.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      acc[service] = (acc[service] || 0) + (apt.cost || 0);
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      period,
      startDate,
      endDate,
      totalRevenue,
      averagePerAppointment,
      totalAppointments: appointments.length,
      revenueByService: Object.entries(revenueByService)
        .sort(([,a], [,b]) => b - a)
        .map(([service, revenue]) => ({ service, revenue }))
    });

  } catch (error) {
    console.error("Error fetching revenue statistics:", error);
    res.status(500).json({ error: "Failed to fetch revenue statistics" });
  }
});

export default statisticsRouter;
