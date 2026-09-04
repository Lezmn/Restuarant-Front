import { delay, mockServiceRequests } from '@/lib/mock/db'
import { ServiceRequestStatus } from '@/types/enums'
import type { Id, ServiceRequest } from '@/types/models'

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  await delay()
  return [...mockServiceRequests].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function resolveServiceRequest(id: Id): Promise<void> {
  await delay(200)
  const req = mockServiceRequests.find((r) => r.id === id)
  if (!req) throw new Error('ไม่พบคำขอ')
  req.status = ServiceRequestStatus.RESOLVED
}
