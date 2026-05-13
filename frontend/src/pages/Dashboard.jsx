import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import subscriptionService from "../services/subscription";
import Card from "../components/common/Card";
import { DollarSign, CreditCard, AlertCircle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    monthlySpending: 0,
    upcomingRenewals: 0,
  });
  const [upcomingList, setUpcomingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subscriptions, upcoming] = await Promise.all([
        subscriptionService.getUserSubscriptions(user.id),
        subscriptionService.getUpcomingRenewals(),
      ]);

      // Calculate stats
      const monthlyTotal =
        subscriptions.data?.reduce((sum, sub) => {
          if (sub.frequency === "Monthly") return sum + sub.price;
          if (sub.frequency === "Yearly") return sum + sub.price / 12;
          return sum;
        }, 0) || 0;

      setStats({
        totalSubscriptions: subscriptions.data?.length || 0,
        monthlySpending: monthlyTotal,
        upcomingRenewals: upcoming.data?.length || 0,
      });

      setUpcomingList(upcoming.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSubscriptions}
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Spending</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.monthlySpending.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Renewals</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.upcomingRenewals}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card title="Upcoming Renewals" subtitle="Next 7 days">
        {upcomingList.length > 0 ?
          <div className="space-y-3">
            {upcomingList.map((sub) => (
              <div
                key={sub._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                  <p className="text-sm text-gray-500">
                    Renews on {new Date(sub.renewalDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${sub.price}</p>
                  <p className="text-sm text-gray-500">{sub.frequency}</p>
                </div>
              </div>
            ))}
          </div>
        : <p className="text-center text-gray-500 py-8">
            No upcoming renewals in the next 7 days
          </p>
        }
      </Card>
    </div>
  );
};

export default Dashboard;
