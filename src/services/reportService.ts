import axios from "axios";

const api = axios.create({
  baseURL: "http://10.188.44.35:5000/api",
});

export interface ReportSummary {
  totalPorts: number;
  portsUp: number;
  portsDown: number;
  availability: number;
  averageBandwidthIn: number;
  averageBandwidthOut: number;
  totalErrors: number;
}

export interface PortMetric {
  _id: string;
  hostname: string;
  portId: string;
  portName: string;
  status: string;
  bandwidthIn: number;
  bandwidthOut: number;
  errorsIn: number;
  errorsOut: number;
  availability: number;
  timestamp: string;
}

export interface WeeklyReportResponse {
  summary: ReportSummary;
  data: PortMetric[];
}

export const getWeeklyReport = async (
  startDate: string,
  endDate: string
): Promise<WeeklyReportResponse> => {

  const response = await api.get<WeeklyReportResponse>(
    "/report/weekly-report",
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};