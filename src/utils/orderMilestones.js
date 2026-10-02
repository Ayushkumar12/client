/**
 * Order Milestones & Delhivery Scan Locations Helper
 * Formats live or lifecycle milestone checkpoints for orders across the customer dashboard.
 */

export function getOrderMilestones(order) {
  if (!order) return [];

  // If order already has stored tracking_history or scans from server
  let serverHistory = order.tracking_history;
  if (typeof serverHistory === 'string') {
    try {
      serverHistory = JSON.parse(serverHistory);
    } catch (e) {
      serverHistory = null;
    }
  }

  if (Array.isArray(serverHistory) && serverHistory.length > 0) {
    return serverHistory.map((item, idx) => ({
      activity: item.activity || item.title || item.status || 'Checkpoint Update',
      location: item.location || 'Delhivery Logistics Hub',
      timestamp: item.timestamp || item.time || new Date().toLocaleString('en-IN'),
      status: item.status || item.activity || 'Scan processed',
      completed: item.completed !== undefined ? item.completed : idx === 0,
      current: Boolean(item.current)
    }));
  }

  const createdDate = new Date(order.created_at || Date.now());
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const status = (order.order_status || order.delhivery_status || 'shipped').toLowerCase();
  
  let addr = {};
  if (typeof order.shipping_address === 'string') {
    try {
      addr = JSON.parse(order.shipping_address);
    } catch (e) {
      addr = {};
    }
  } else if (order.shipping_address) {
    addr = order.shipping_address;
  }

  const destCity = addr.city || 'Delhi';
  const destPin = addr.pincode || '110001';

  const t1 = formatDate(createdDate);
  const t2 = formatDate(new Date(createdDate.getTime() + 45 * 60 * 1000));
  const t3 = formatDate(new Date(createdDate.getTime() + 3 * 3600 * 1000));
  const t4 = formatDate(new Date(createdDate.getTime() + 24 * 3600 * 1000));
  const t5 = formatDate(new Date(createdDate.getTime() + 48 * 3600 * 1000));

  if (status === 'delivered') {
    return [
      {
        activity: 'Delivered to Consignee',
        location: `${destCity} - ${destPin}`,
        timestamp: t5,
        status: 'Delivered with Contactless / OTP Verification',
        completed: true,
        current: true
      },
      {
        activity: 'Out for Delivery',
        location: `${destCity} Local Delivery Center`,
        timestamp: t4,
        status: 'Shipment handed over to delivery executive for final drop-off',
        completed: true,
        current: false
      },
      {
        activity: 'Reached Destination Sorting Hub',
        location: `${destCity} Main Sorting Facility`,
        timestamp: t3,
        status: 'Inbound sorting completed at destination hub',
        completed: true,
        current: false
      },
      {
        activity: 'Dispatched from Fulfillment Facility',
        location: 'Delhi Central Logistics Hub (110020)',
        timestamp: t2,
        status: 'In transit via Delhivery Express Surface & Air Corridor',
        completed: true,
        current: false
      },
      {
        activity: 'Order Manifested & Waybill Assigned',
        location: 'OCT9 Central Hub, New Delhi (110020)',
        timestamp: t1,
        status: 'Shipment data electronically submitted to Delhivery Logistics Network',
        completed: true,
        current: false
      }
    ];
  }

  if (status === 'shipped' || status === 'in_transit' || status === 'manifested') {
    return [
      {
        activity: 'In Transit to Destination Sorting Facility',
        location: 'Delhivery National Express Corridor, Gurugram Hub',
        timestamp: t3,
        status: `In transit to ${destCity} Delivery Center via Delhivery Surface Express`,
        completed: false,
        current: true
      },
      {
        activity: 'Dispatched from Fulfillment Facility',
        location: 'Delhi Central Logistics Hub (110020)',
        timestamp: t2,
        status: 'Inbound scan completed at Delhi Central Sort Hub',
        completed: true,
        current: false
      },
      {
        activity: 'Order Manifested & Waybill Assigned',
        location: 'OCT9 Central Hub, New Delhi (110020)',
        timestamp: t1,
        status: 'Shipment data electronically submitted to Delhivery Logistics Network',
        completed: true,
        current: false
      }
    ];
  }

  if (status === 'processing' || status === 'confirmed') {
    return [
      {
        activity: 'Packing & Quality Inspection In Progress',
        location: 'OCT9 Fulfillment Facility, New Delhi (110020)',
        timestamp: t2,
        status: 'Garment undergoing luxury finishing, barcode labeling & Delhivery packaging',
        completed: false,
        current: true
      },
      {
        activity: 'Order Confirmed & Payment Verified',
        location: 'OCT9 Central Hub, New Delhi (110020)',
        timestamp: t1,
        status: 'Order verified and queued for Delhivery logistics dispatch',
        completed: true,
        current: false
      }
    ];
  }

  if (status === 'cancelled') {
    return [
      {
        activity: 'Order Cancelled & Refund Initiated',
        location: 'OCT9 Central Customer Operations',
        timestamp: t2,
        status: 'Cancellation processed; refund will reflect within 24-48 business hours',
        completed: true,
        current: true
      },
      {
        activity: 'Order Placed & Registered',
        location: 'OCT9 Central Hub, New Delhi (110020)',
        timestamp: t1,
        status: 'Order was placed and confirmed in system',
        completed: true,
        current: false
      }
    ];
  }

  return [
    {
      activity: 'Order Confirmed & Manifested',
      location: 'OCT9 Central Hub, New Delhi (110020)',
      timestamp: t1,
      status: 'Order registered with logistics network',
      completed: true,
      current: true
    }
  ];
}
