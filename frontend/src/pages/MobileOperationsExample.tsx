/**
 * Mobile Operations Example
 * Demonstration of mobile-first operational workflows
 */
import React from 'react'
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users,
  Recycle,
  Calendar
} from 'lucide-react'
import {
  Stack,
  Container,
  MobileStatusBar,
  MobileQuickActions,
  MobileCollectionItem,
  MobileCard,
  Button
} from '../design-system'

const MobileOperationsExample: React.FC = () => {
  const [collectionItems, setCollectionItems] = React.useState([
    {
      id: 'COL-001',
      address: '123 Oak Street, Ward 5',
      status: 'pending' as const,
      scheduledTime: '09:00 AM',
      customerInfo: {
        name: 'John Smith',
        phone: '+1234567890',
      },
      specialInstructions: 'Large furniture items on curb',
    },
    {
      id: 'COL-002', 
      address: '456 Pine Avenue, Ward 5',
      status: 'in_progress' as const,
      scheduledTime: '09:30 AM',
      customerInfo: {
        name: 'Sarah Johnson',
        phone: '+1234567891',
      },
    },
    {
      id: 'COL-003',
      address: '789 Maple Drive, Ward 5',
      status: 'completed' as const,
      scheduledTime: '08:30 AM',
      customerInfo: {
        name: 'Mike Davis',
        phone: '+1234567892',
      },
    },
  ])

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setCollectionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, status: newStatus as any } : item
      )
    )
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/maps?q=${encodedAddress}`)
  }

  const statusItems = [
    {
      label: 'Pending',
      value: collectionItems.filter(item => item.status === 'pending').length,
      icon: <Clock className="w-4 h-4" />,
      variant: 'warning' as const,
    },
    {
      label: 'In Progress',
      value: collectionItems.filter(item => item.status === 'in_progress').length,
      icon: <Truck className="w-4 h-4" />,
      variant: 'default' as const,
    },
    {
      label: 'Completed',
      value: collectionItems.filter(item => item.status === 'completed').length,
      icon: <CheckCircle2 className="w-4 h-4" />,
      variant: 'success' as const,
    },
    {
      label: 'Issues',
      value: 0, // No failed items in current data structure
      icon: <AlertTriangle className="w-4 h-4" />,
      variant: 'error' as const,
    },
  ]

  const quickActions = [
    {
      label: 'Route View',
      icon: <MapPin className="w-4 h-4" />,
      onClick: () => console.log('Opening route view'),
      variant: 'primary' as const,
    },
    {
      label: 'Report Issue',
      icon: <AlertTriangle className="w-4 h-4" />,
      onClick: () => console.log('Opening issue report'),
      variant: 'outline' as const,
    },
    {
      label: 'Break',
      icon: <Clock className="w-4 h-4" />,
      onClick: () => console.log('Starting break'),
      variant: 'secondary' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Container maxWidth="md" padding="md">
        <Stack gap="lg" className="py-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Route Operations
            </h1>
            <p className="text-slate-600">
              Ward 5 - Truck #247
            </p>
          </div>

          {/* Status Overview */}
          <MobileStatusBar items={statusItems} />

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Quick Actions
            </h2>
            <MobileQuickActions actions={quickActions} />
          </div>

          {/* Today's Collections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Today's Collections
              </h2>
              <span className="text-sm text-slate-500">
                {collectionItems.length} total
              </span>
            </div>

            <Stack gap="sm">
              {collectionItems.map((item) => (
                <MobileCollectionItem
                  key={item.id}
                  {...item}
                  onUpdateStatus={handleUpdateStatus}
                  onCall={handleCall}
                  onNavigate={handleNavigate}
                />
              ))}
            </Stack>
          </div>

          {/* Additional Info Cards */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Route Information
            </h2>
            
            <Stack gap="sm">
              <MobileCard
                title="Vehicle Status"
                subtitle="Truck #247 - All systems operational"
                status={{ label: 'Operational', variant: 'success' }}
                metadata={[
                  {
                    icon: <Truck className="w-4 h-4" />,
                    label: 'Fuel',
                    value: '85%',
                  },
                  {
                    icon: <Users className="w-4 h-4" />,
                    label: 'Crew',
                    value: '3 members',
                  },
                ]}
              />

              <MobileCard
                title="Recycling Summary"
                subtitle="Items collected today"
                metadata={[
                  {
                    icon: <Recycle className="w-4 h-4" />,
                    label: 'Total Weight',
                    value: '2.4 tons',
                  },
                  {
                    icon: <Calendar className="w-4 h-4" />,
                    label: 'Last Update',
                    value: '10:30 AM',
                  },
                ]}
              >
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">45</div>
                    <div className="text-xs text-slate-600">Plastic</div>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">28</div>
                    <div className="text-xs text-slate-600">Metal</div>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">12</div>
                    <div className="text-xs text-slate-600">Glass</div>
                  </div>
                </div>
              </MobileCard>
            </Stack>
          </div>

          {/* End of Route Actions */}
          <div className="border-t border-slate-200 pt-6">
            <Stack gap="sm">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                icon={<MapPin className="w-4 h-4" />}
              >
                Return to Depot
              </Button>
              
              <Button
                variant="success"
                size="lg"
                fullWidth
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Complete Route
              </Button>
            </Stack>
          </div>
        </Stack>
      </Container>
    </div>
  )
}

export default MobileOperationsExample