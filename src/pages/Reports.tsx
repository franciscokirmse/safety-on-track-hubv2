
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  BarChart2, 
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();

  const reportStats = [
    {
      title: "Training Completion Rate",
      value: "87%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      title: "Safety Incidents",
      value: "3",
      change: "-2",
      trend: "down",
      icon: AlertTriangle,
      color: "text-orange-400"
    },
    {
      title: "Active Users",
      value: "142",
      change: "+12",
      trend: "up",
      icon: Users,
      color: "text-blue-400"
    },
    {
      title: "Compliance Score",
      value: "94%",
      change: "+3%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-400"
    }
  ];

  const availableReports = [
    {
      id: 1,
      title: "Monthly Training Report",
      description: "Comprehensive training completion and progress report",
      type: "PDF",
      date: "May 2024",
      status: "ready"
    },
    {
      id: 2,
      title: "Safety Incident Analysis",
      description: "Detailed analysis of workplace safety incidents",
      type: "PDF",
      date: "May 2024",
      status: "ready"
    },
    {
      id: 3,
      title: "Compliance Audit Report",
      description: "OSHA compliance status and recommendations",
      type: "PDF",
      date: "Q2 2024",
      status: "ready"
    },
    {
      id: 4,
      title: "Equipment Maintenance Log",
      description: "Safety equipment inspection and maintenance records",
      type: "Excel",
      date: "May 2024",
      status: "generating"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Reports</h1>
                <p className="text-sm text-gray-400">Analytics and compliance reports</p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportStats.map((stat, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                        <span className={`text-sm ${stat.color}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Placeholder */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-blue-400" />
                <span className="text-white">Training Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Chart visualization would appear here</p>
                  <p className="text-sm text-gray-500">Integration with charts library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Reports */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-white">Available Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{report.title}</h3>
                      <p className="text-sm text-gray-400">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{report.type}</span>
                        <span className="text-xs text-gray-500">{report.date}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'ready' 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-yellow-900/20 text-yellow-400'
                        }`}>
                          {report.status === 'ready' ? 'Ready' : 'Generating...'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={report.status !== 'ready'}
                      className="border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
