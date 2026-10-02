/**
 * Order Milestones & Delhivery Scan Locations Helper
 * Formats live or lifecycle milestone checkpoints for orders across the customer dashboard.
 */

export function getMilestoneTrackerSteps(order, customStatus = null) {
  if (!order && !customStatus) {
    return {
      steps: [],
      progressPercent: '0%',
      isCancelled: false,
      isDelivered: false,
      currentStepKey: 'confirmed'
    };
  }

  const rawStatus = (
    customStatus ||
    order?.order_status ||
    order?.delhivery_status ||
    order?.shipping_status ||
    'confirmed'
  ).toLowerCase();

  const isCancelled = rawStatus === 'cancelled';
  const isDelivered = rawStatus === 'delivered' || rawStatus === 'completed';
  const isOutForDelivery = !isDelivered && (rawStatus === 'out_for_delivery' || rawStatus === 'out-for-delivery' || rawStatus === 'out for delivery');
  const isShipped = !isDelivered && !isOutForDelivery && (rawStatus === 'shipped' || rawStatus === 'in_transit' || rawStatus === 'in-transit' || rawStatus === 'dispatched' || rawStatus === 'picked_up');
  const isProcessing = !isDelivered && !isOutForDelivery && !isShipped && (rawStatus === 'processing' || rawStatus === 'packed' || rawStatus === 'ready_for_dispatch');
  const isConfirmed = !isDelivered && !isOutForDelivery && !isShipped && !isProcessing && !isCancelled;

  let addr = {};
  if (typeof order?.shipping_address === 'string') {
    try {
      addr = JSON.parse(order.shipping_address);
    } catch (e) {
      addr = {};
    }
  } else if (order?.shipping_address) {
    addr = order.shipping_address;
  }

  const destCity = addr.city || order?.destination_city || 'Delhi';
  const destPin = addr.pincode || order?.destination_pincode || '110001';

  const createdDate = new Date(order?.created_at || Date.now());
  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  const t1 = formatDateTime(createdDate);
  const t2 = formatDateTime(new Date(createdDate.getTime() + 45 * 60 * 1000));
  const t3 = formatDateTime(new Date(createdDate.getTime() + 3 * 3600 * 1000));
  const t4 = formatDateTime(new Date(createdDate.getTime() + 24 * 3600 * 1000));
  const t5 = formatDateTime(new Date(createdDate.getTime() + 48 * 3600 * 1000));

  const expectedDateShort = order?.delhivery_expected_date || formatShortDate(new Date(createdDate.getTime() + 48 * 3600 * 1000));

  // Determine progress percentage on the connecting track
  let progressPercent = '0%';
  if (isDelivered) {
    progressPercent = '100%';
  } else if (isOutForDelivery) {
    progressPercent = '75%';
  } else if (isShipped) {
    progressPercent = '50%';
  } else if (isProcessing) {
    progressPercent = '25%';
  } else {
    progressPercent = '0%';
  }

  // 1. Confirmed
  const step1 = {
    id: 1,
    key: 'confirmed',
    label: 'Confirmed',
    location: 'OCT9 Central Hub, New Delhi',
    shortLocation: 'OCT9 Hub, Delhi',
    timestamp: t1,
    activity: 'Order Manifested & Waybill Assigned',
    status: isConfirmed ? 'current' : 'completed',
    isCompleted: true,
    isCurrent: isConfirmed
  };

  // 2. Packed
  const step2Done = isDelivered || isOutForDelivery || isShipped;
  const step2Current = isProcessing && !step2Done && !isCancelled;
  const step2 = {
    id: 2,
    key: 'packed',
    label: 'Packed',
    location: 'Delhi Central Sort Hub (110020)',
    shortLocation: 'Delhi Sort Hub',
    timestamp: step2Done ? t2 : step2Current ? 'Quality Check In Progress' : 'Pending Fulfillment',
    activity: step2Done ? 'Quality Check & Barcode Labelled' : step2Current ? 'Undergoing Quality Inspection' : 'Awaiting Fulfillment',
    status: step2Done ? 'completed' : step2Current ? 'current' : 'upcoming',
    isCompleted: step2Done,
    isCurrent: step2Current
  };

  // 3. Shipped
  const step3Done = isDelivered || isOutForDelivery;
  const step3Current = isShipped && !step3Done && !isCancelled;
  const step3 = {
    id: 3,
    key: 'shipped',
    label: 'Shipped',
    location: 'Gurugram National Express Corridor',
    shortLocation: step3Current ? 'Gurugram Corridor' : 'Transit Corridor',
    timestamp: step3Done ? t3 : step3Current ? t3 : 'Awaiting Dispatch',
    activity: step3Done ? 'Inbound Scan Passed' : step3Current ? 'In Transit via Express Corridor' : 'Awaiting Courier Handover',
    status: step3Done ? 'completed' : step3Current ? 'current' : 'upcoming',
    isCompleted: step3Done,
    isCurrent: step3Current
  };

  // 4. Out for Delivery
  const step4Done = isDelivered;
  const step4Current = isOutForDelivery && !step4Done && !isCancelled;
  const step4 = {
    id: 4,
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    location: `${destCity} Local Delivery Center`,
    shortLocation: `${destCity} Local Hub`,
    timestamp: step4Done ? t4 : step4Current ? 'Today' : `Expected ${expectedDateShort}`,
    activity: step4Done ? 'Courier Handover Complete' : step4Current ? 'Out with Delivery Executive' : 'Pending Local Inbound',
    status: step4Done ? 'completed' : step4Current ? 'current' : 'upcoming',
    isCompleted: step4Done,
    isCurrent: step4Current
  };

  // 5. Delivered
  const step5Done = isDelivered;
  const step5 = {
    id: 5,
    key: 'delivered',
    label: 'Delivered',
    location: `${destCity} (${destPin})`,
    shortLocation: `${destCity} (${destPin})`,
    timestamp: step5Done ? t5 : `Est. ${expectedDateShort}`,
    activity: step5Done ? 'Delivered with Contactless OTP' : 'Final Doorstep Drop-off',
    status: step5Done ? 'completed' : 'upcoming',
    isCompleted: step5Done,
    isCurrent: step5Done
  };

  return {
    steps: [step1, step2, step3, step4, step5],
    progressPercent,
    isCancelled,
    isDelivered,
    currentStepKey: isDelivered ? 'delivered' : isOutForDelivery ? 'out_for_delivery' : isShipped ? 'shipped' : isProcessing ? 'packed' : 'confirmed'
  };
}

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
