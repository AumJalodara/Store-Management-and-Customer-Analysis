import React from 'react';

const STYLES = {
  'Low':          'bg-red-50 text-red-600 border border-red-100',
  'Out of Stock': 'bg-gray-100 text-gray-500 border border-gray-200',
  'OK':           'bg-green-50 text-green-600 border border-green-100',
  'Completed':    'bg-green-50 text-green-600 border border-green-100',
  'In Transit':   'bg-blue-50 text-blue-600 border border-blue-100',
  'Pending':      'bg-amber-50 text-amber-600 border border-amber-100',
  'Checkup':      'bg-purple-50 text-purple-600 border border-purple-100',
};

export default function Badge({ status }) {
  const cls = STYLES[status] || 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
