import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  CheckCircle,
  AlertCircle,
  Timer,
  CircleOff,
} from 'lucide-react'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
 
  {
    label: 'Todo',
    value: 'active' as const,
    icon: Circle,
  },
  {
    label: 'In Progress',
    value: 'pending' as const,
    icon: Timer,
  },
  {
    label: 'Done',
    value: 'archived' as const,
    icon: CheckCircle,
  },
  {
    label: 'Canceled',
    value: 'inactive' as const,
    icon: CircleOff,
  },
]

export const role = [
  {
    label: 'Low',
    value: 'low' as const,
    icon: ArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium' as const,
    icon: ArrowRight,
  },
  {
    label: 'High',
    value: 'high' as const,
    icon: ArrowUp,
  },
  {
    label: 'Critical',
    value: 'critical' as const,
    icon: AlertCircle,
  },
]
