import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import * as reservationApi from '../api/reservations';
import dayjs from 'dayjs';
import type { Reservation } from '../types';

export const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await reservationApi.getReservationsByUser(user._id);
      setReservations(data);
    } catch (error) {
      message.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await reservationApi.cancelReservation(id);
      message.success('Cancelled successfully');
      loadReservations();
    } catch (error: any) {
      message.error(error?.message || 'Failed to cancel');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'CONFIRMED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Parking Space',
      key: 'space',
      render: (_: any, record: Reservation) => {
        const space = record.space as any;
        return space?.spaceNumber || 'Unknown';
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: Reservation) => (
        record.status === 'PENDING' && (
          <Button
            danger
            size="small"
            onClick={() => handleCancel(record._id)}
          >
            Cancel
          </Button>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>My Reservations</h1>

      <Table
        columns={columns}
        dataSource={reservations}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
